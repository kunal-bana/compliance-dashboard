import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, adminState, managerState, viewerState, mockRegulations } from "../../test-utils/testUtils.helper";

//  ThemeContext mock 
jest.mock("../../theme/ThemeContext", () => ({
  useThemeMode: () => ({ mode: "light", toggleTheme: jest.fn() }),
  ThemeContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseGetRegulations = jest.fn();
const mockUseAddRegulation = jest.fn(() => [jest.fn(), {}]);
const mockUseUpdateRegulation = jest.fn(() => [jest.fn(), {}]);
const mockUseDeleteRegulation = jest.fn(() => [jest.fn(), {}]);

jest.mock("../../features/regulations/regulationsApi", () => ({
  useGetRegulationsQuery: () => mockUseGetRegulations(),
  useAddRegulationMutation: () => mockUseAddRegulation(),
  useUpdateRegulationMutation: () => mockUseUpdateRegulation(),
  useDeleteRegulationMutation: () => mockUseDeleteRegulation(),
}));

jest.mock("ag-grid-react", () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      {rowData?.map((row: any, i: number) => (
        <div key={i} data-testid={`grid-row-${i}`}>
          {columnDefs?.map((col: any, j: number) => (
            <span key={j}>
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

jest.mock("ag-grid-community/styles/ag-grid.css", () => { });
jest.mock("ag-grid-community/styles/ag-theme-alpine.css", () => { });

jest.mock("../../components/AddRegulationDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="add-regulation-dialog">
        <button onClick={onClose}>Close Add</button>
      </div>
    ) : null,
}));

jest.mock("../../components/EditRegulationDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="edit-regulation-dialog">
        <button onClick={onClose}>Close Edit</button>
      </div>
    ) : null,
}));

jest.mock("../../components/DeleteRegulationDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="delete-regulation-dialog">
        <button onClick={onClose}>Close Delete</button>
      </div>
    ) : null,
}));

let Regulations: React.ComponentType;

beforeAll(async () => {
  ({ default: Regulations } = await import("../../pages/Regulations"));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetRegulations.mockReturnValue({ data: mockRegulations, isLoading: false });
});

describe("Regulations Page", () => {
  describe("Rendering", () => {
    it("renders Regulations heading", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByText("Regulations")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByText(/Track and manage compliance regulations/i)).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByPlaceholderText(/Search regulations/i)).toBeInTheDocument();
    });

    it("renders status filter", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });

    it("renders grid", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      mockUseGetRegulations.mockReturnValue({ data: [], isLoading: true });
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByText(/Loading regulations/i)).toBeInTheDocument();
    });
  });

  describe("ADMIN permissions", () => {
    it("shows Add Regulation button", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getByRole("button", { name: /Add Regulation/i })).toBeInTheDocument();
    });

    it("opens Add Regulation dialog on button click", async () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Regulation/i }));
      await waitFor(() => {
        expect(screen.getByTestId("add-regulation-dialog")).toBeInTheDocument();
      });
    });

    it("closes Add dialog on Close click", async () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Regulation/i }));
      await waitFor(() => expect(screen.getByTestId("add-regulation-dialog")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Close Add"));
      await waitFor(() => {
        expect(screen.queryByTestId("add-regulation-dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("MANAGER permissions", () => {
    it("shows Add Regulation button for MANAGER", () => {
      renderWithProviders(<Regulations />, { preloadedState: managerState });
      expect(screen.getByRole("button", { name: /Add Regulation/i })).toBeInTheDocument();
    });
  });

  describe("VIEWER permissions", () => {
    it("does NOT show Add Regulation button for VIEWER", () => {
      renderWithProviders(<Regulations />, { preloadedState: viewerState });
      expect(screen.queryByRole("button", { name: /Add Regulation/i })).not.toBeInTheDocument();
    });
  });

  describe("Search and filter", () => {
    it("updates search on input", async () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      const input = screen.getByPlaceholderText(/Search regulations/i);
      await userEvent.type(input, "GDPR");
      expect(input).toHaveValue("GDPR");
    });

    it("shows Clear button when filter is active", async () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      await userEvent.type(screen.getByPlaceholderText(/Search regulations/i), "X");
      expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
    });

    it("clears filter on Clear click", async () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      const input = screen.getByPlaceholderText(/Search regulations/i);
      await userEvent.type(input, "X");
      fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
      expect(input).toHaveValue("");
    });
  });

  describe("Grid data", () => {
    it("renders correct number of rows", () => {
      renderWithProviders(<Regulations />, { preloadedState: adminState });
      expect(screen.getAllByTestId(/grid-row-/)).toHaveLength(mockRegulations.length);
    });
  });
});