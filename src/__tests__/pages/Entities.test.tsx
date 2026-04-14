import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, adminState, managerState, viewerState, mockEntities } from "../../test-utils/testUtils.helper";

jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

const mockUseGetEntities = jest.fn();
const mockUseAddEntity = jest.fn(() => [jest.fn(), {}]);
const mockUseUpdateEntity = jest.fn(() => [jest.fn(), {}]);
const mockUseDeleteEntity = jest.fn(() => [jest.fn(), {}]);

jest.mock("../../features/entities/entitiesApi", () => ({
  useGetEntitiesQuery: () => mockUseGetEntities(),
  useAddEntityMutation: () => mockUseAddEntity(),
  useUpdateEntityMutation: () => mockUseUpdateEntity(),
  useDeleteEntityMutation: () => mockUseDeleteEntity(),
}));

jest.mock("ag-grid-react", () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      {rowData?.map((row: any, i: number) => (
        <div key={i} data-testid={`grid-row-${i}`}>
          {columnDefs?.map((col: any, j: number) => (
            <span key={j} data-testid={`cell-${col.field || col.headerName}-${i}`}>
              {col.cellRenderer
                ? col.cellRenderer({ value: row[col.field], data: row })
                : String(row[col.field] ?? "")}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("ag-grid-community/styles/ag-grid.css", () => {});
jest.mock("ag-grid-community/styles/ag-theme-alpine.css", () => {});

jest.mock("../../components/AddEntityDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="add-entity-dialog">
        <button onClick={onClose}>Close Add</button>
      </div>
    ) : null,
}));

jest.mock("../../components/EditEntityDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="edit-entity-dialog">
        <button onClick={onClose}>Close Edit</button>
      </div>
    ) : null,
}));

jest.mock("../../components/DeleteEntityDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="delete-entity-dialog">
        <button onClick={onClose}>Close Delete</button>
      </div>
    ) : null,
}));

let Entities: React.ComponentType;

beforeAll(async () => {
  ({ default: Entities } = await import("../../pages/Entities"));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetEntities.mockReturnValue({ data: mockEntities, isLoading: false });
});

describe("Entities Page", () => {
  describe("Rendering", () => {
    it("renders Entities heading", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByText("Entities")).toBeInTheDocument();
    });

    it("renders description subtitle", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByText(/Manage and monitor/i)).toBeInTheDocument();
    });

    it("renders search field", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByPlaceholderText(/Search entities/i)).toBeInTheDocument();
    });

    it("renders status filter dropdown", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });

    it("renders ag-grid table", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      mockUseGetEntities.mockReturnValue({ data: [], isLoading: true });
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByText(/Loading entities/i)).toBeInTheDocument();
    });
  });

  describe("ADMIN permissions", () => {
    it("shows Add Entity button for ADMIN", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.getByRole("button", { name: /Add Entity/i })).toBeInTheDocument();
    });

    it("opens Add Entity dialog on button click", async () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Entity/i }));
      await waitFor(() => {
        expect(screen.getByTestId("add-entity-dialog")).toBeInTheDocument();
      });
    });

    it("closes Add Entity dialog", async () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Entity/i }));
      await waitFor(() => expect(screen.getByTestId("add-entity-dialog")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Close Add"));
      await waitFor(() => {
        expect(screen.queryByTestId("add-entity-dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("MANAGER permissions", () => {
    it("shows Add Entity button for MANAGER", () => {
      renderWithProviders(<Entities />, { preloadedState: managerState });
      expect(screen.getByRole("button", { name: /Add Entity/i })).toBeInTheDocument();
    });
  });

  describe("VIEWER permissions", () => {
    it("does NOT show Add Entity button for VIEWER", () => {
      renderWithProviders(<Entities />, { preloadedState: viewerState });
      expect(screen.queryByRole("button", { name: /Add Entity/i })).not.toBeInTheDocument();
    });
  });

  describe("Search and filter", () => {
    it("updates search text on input", async () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      const searchInput = screen.getByPlaceholderText(/Search entities/i);
      await userEvent.type(searchInput, "Acme");
      expect(searchInput).toHaveValue("Acme");
    });

    it("shows Clear button when search is active", async () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      const searchInput = screen.getByPlaceholderText(/Search entities/i);
      await userEvent.type(searchInput, "Test");
      expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
    });

    it("clears search text on Clear button click", async () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      const searchInput = screen.getByPlaceholderText(/Search entities/i);
      await userEvent.type(searchInput, "Test");
      fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
      expect(searchInput).toHaveValue("");
    });

    it("does NOT show Clear button when no filter active", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      expect(screen.queryByRole("button", { name: /Clear/i })).not.toBeInTheDocument();
    });
  });

  describe("Grid data", () => {
    it("renders correct number of rows", () => {
      renderWithProviders(<Entities />, { preloadedState: adminState });
      const rows = screen.getAllByTestId(/^grid-row-/);
      expect(rows).toHaveLength(mockEntities.length);
    });
  });
});