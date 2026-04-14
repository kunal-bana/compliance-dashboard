import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  adminState,
  managerState,
  viewerState,
  mockTasks,
  mockEntities,
  mockRegulations,
  mockUsers,
} from "../../test-utils/testUtils.helper";

jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

const mockNavigate = jest.fn();
const mockLocation = { state: {} };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

const mockUseGetTasks = jest.fn();
const mockUseGetEntities = jest.fn();
const mockUseGetRegulations = jest.fn();
const mockUseGetUsers = jest.fn();

jest.mock("../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: () => mockUseGetTasks(),
}));
jest.mock("../../features/entities/entitiesApi", () => ({
  useGetEntitiesQuery: () => mockUseGetEntities(),
}));
jest.mock("../../features/regulations/regulationsApi", () => ({
  useGetRegulationsQuery: () => mockUseGetRegulations(),
}));
jest.mock("../../features/users/usersApi", () => ({
  useGetUsersQuery: () => mockUseGetUsers(),
}));

jest.mock("../../utils/taskUtils", () => ({
  isTaskOverdue: (task: any) => {
    if (task.status === "Completed") return false;
    const due = task.dueDate?.toDate?.();
    return due ? due < new Date() : false;
  },
  getTaskDisplayStatus: (task: any) => {
    if (task.status !== "Completed") {
      const due = task.dueDate?.toDate?.();
      if (due && due < new Date()) return "Overdue";
    }
    return task.status;
  },
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

jest.mock("../../components/AddTaskDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="add-task-dialog">
        <button onClick={onClose}>Close Add</button>
      </div>
    ) : null,
}));

jest.mock("../../components/TaskDetailDialog", () => ({
  __esModule: true,
  default: ({ open, onClose, task }: any) =>
    open ? (
      <div data-testid="task-detail-dialog">
        <span data-testid="dialog-task-title">{task?.title}</span>
        <button onClick={onClose}>Close Detail</button>
      </div>
    ) : null,
}));

let Tasks: React.ComponentType;

beforeAll(async () => {
  ({ default: Tasks } = await import("../../pages/Tasks"));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetTasks.mockReturnValue({ data: mockTasks, isLoading: false });
  mockUseGetEntities.mockReturnValue({ data: mockEntities, isLoading: false });
  mockUseGetRegulations.mockReturnValue({ data: mockRegulations, isLoading: false });
  mockUseGetUsers.mockReturnValue({ data: mockUsers, isLoading: false });
  mockLocation.state = {};
});

describe("Tasks Page", () => {
  describe("Rendering", () => {
    it("renders Tasks heading", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText("Tasks")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText(/Assign, track and resolve/i)).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument();
    });

    it("renders status filter", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });

    it("renders ag-grid", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      mockUseGetTasks.mockReturnValue({ data: [], isLoading: true });
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText(/Loading tasks/i)).toBeInTheDocument();
    });

    it("renders all tasks in grid", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      const rows = screen.getAllByTestId(/^grid-row-/);
      expect(rows).toHaveLength(mockTasks.length);
    });
  });

  describe("ADMIN/MANAGER permissions", () => {
    it("shows Add Task button for ADMIN", () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument();
    });

    it("shows Add Task button for MANAGER", () => {
      renderWithProviders(<Tasks />, { preloadedState: managerState });
      expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument();
    });

    it("opens Add Task dialog on button click", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Task/i }));
      await waitFor(() => {
        expect(screen.getByTestId("add-task-dialog")).toBeInTheDocument();
      });
    });

    it("closes Add Task dialog", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      fireEvent.click(screen.getByRole("button", { name: /Add Task/i }));
      await waitFor(() => expect(screen.getByTestId("add-task-dialog")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Close Add"));
      await waitFor(() => {
        expect(screen.queryByTestId("add-task-dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("VIEWER permissions", () => {
    it("does NOT show Add Task button for VIEWER", () => {
      renderWithProviders(<Tasks />, { preloadedState: viewerState });
      expect(screen.queryByRole("button", { name: /Add Task/i })).not.toBeInTheDocument();
    });
  });

  describe("Search and filter", () => {
    it("updates search on input", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      const input = screen.getByPlaceholderText(/Search tasks/i);
      await userEvent.type(input, "GDPR");
      expect(input).toHaveValue("GDPR");
    });

    it("shows Clear button when search is active", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      await userEvent.type(screen.getByPlaceholderText(/Search tasks/i), "X");
      expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
    });

    it("clears search on Clear click", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      const input = screen.getByPlaceholderText(/Search tasks/i);
      await userEvent.type(input, "X");
      fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
      expect(input).toHaveValue("");
    });

    it("filters tasks by search text", async () => {
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      const input = screen.getByPlaceholderText(/Search tasks/i);
      await userEvent.type(input, "Complete GDPR audit");
      await waitFor(() => {
        const rows = screen.getAllByTestId(/^grid-row-/);
        expect(rows).toHaveLength(1);
      });
    });

    it("filters tasks by status – no results for non-matching status", async () => {
      mockUseGetTasks.mockReturnValue({
        data: mockTasks.filter((t) => t.status === "Completed"),
        isLoading: false,
      });
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getAllByTestId(/^grid-row-/)).toHaveLength(1);
    });
  });

  describe("Dashboard filter state (from navigation)", () => {
    it("shows filter chip when overdue filter is active", () => {
      (mockLocation as any).state = { overdue: true };
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText(/Filter: Overdue/i)).toBeInTheDocument();
    });

    it("shows filter chip when status filter is active", () => {
      (mockLocation as any).state = { status: "Pending" };
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText(/Filter: Pending/i)).toBeInTheDocument();
    });

    it("shows active filter chip", () => {
      (mockLocation as any).state = { active: true };
      renderWithProviders(<Tasks />, { preloadedState: adminState });
      expect(screen.getByText(/Filter: Active/i)).toBeInTheDocument();
    });
  });
});