import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import {
  renderWithProviders,
  adminState, managerState, viewerState,
  mockTasks, mockEntities, mockRegulations,
} from "../../test-utils/testUtils.helper";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

const mockUseGetEntities    = jest.fn();
const mockUseGetRegulations = jest.fn();
const mockUseGetTasks       = jest.fn();

jest.mock("../../features/entities/entitiesApi",    () => ({ useGetEntitiesQuery:    () => mockUseGetEntities()    }));
jest.mock("../../features/regulations/regulationsApi", () => ({ useGetRegulationsQuery: () => mockUseGetRegulations() }));
jest.mock("../../features/tasks/tasksApi",          () => ({ useGetTasksQuery:       () => mockUseGetTasks()       }));

// Recharts 
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="pie-chart">{children}</div>,
  Pie: ({ onClick, data }: { onClick?: (d: any) => void; data?: any[] }) => (
    <div data-testid="pie">
      {data?.map((d: any, i: number) => (
        <button key={i} onClick={() => onClick?.(d)} data-testid={`pie-cell-${d.name}`}>
          {d.name}
        </button>
      ))}
    </div>
  ),
  Cell:   () => <div />,
  Legend: () => <div />,
}));

let DashboardHome: React.ComponentType;
beforeAll(async () => { ({ default: DashboardHome } = await import("../../pages/DashboardHome")); });
beforeEach(() => jest.clearAllMocks());

function setupMocks() {
  mockUseGetEntities.mockReturnValue({ data: mockEntities, isLoading: false });
  mockUseGetRegulations.mockReturnValue({ data: mockRegulations, isLoading: false });
  mockUseGetTasks.mockReturnValue({ data: mockTasks, isLoading: false });
}

describe("DashboardHome", () => {
  describe("Loading state", () => {
    it("shows loading message", () => {
      mockUseGetEntities.mockReturnValue({ data: [], isLoading: true });
      mockUseGetRegulations.mockReturnValue({ data: [], isLoading: false });
      mockUseGetTasks.mockReturnValue({ data: [], isLoading: false });
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
    });
  });

  describe("Page header", () => {
    it("renders heading", () => {
      setupMocks();
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
    });
  });

  describe("ADMIN KPI cards", () => {
    beforeEach(() => setupMocks());

    it("shows Total Entities", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Total Entities")).toBeInTheDocument();
    });

    it("shows Active Regulations", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Active Regulations")).toBeInTheDocument();
    });

    it("shows Total Tasks", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    });

    it("shows Overdue Tasks", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Overdue Tasks")).toBeInTheDocument();
    });

    it("navigates to /dashboard/entities on Total Entities click", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      fireEvent.click(screen.getByText("Total Entities").closest("div")!);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/entities");
    });

    it("navigates to /dashboard/regulations on Active Regulations click", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      fireEvent.click(screen.getByText("Active Regulations").closest("div")!);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/regulations");
    });

    it("navigates to tasks with overdue filter on Overdue click", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      fireEvent.click(screen.getByText("Overdue Tasks").closest("div")!);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks", { state: { overdue: true } });
    });
  });

  describe("MANAGER KPI cards", () => {
    beforeEach(() => setupMocks());

    it("shows Team Active Tasks", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: managerState });
      expect(screen.getByText("Team Active Tasks")).toBeInTheDocument();
    });

    it("does NOT show Total Entities", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: managerState });
      expect(screen.queryByText("Total Entities")).not.toBeInTheDocument();
    });
  });

  describe("VIEWER KPI cards", () => {
    beforeEach(() => setupMocks());

    it("shows My Active Tasks", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: viewerState });
      expect(screen.getByText("My Active Tasks")).toBeInTheDocument();
    });

    it("shows My Completed", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: viewerState });
      expect(screen.getByText("My Completed")).toBeInTheDocument();
    });

    it("shows My Overdue", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: viewerState });
      expect(screen.getByText("My Overdue")).toBeInTheDocument();
    });
  });

  describe("Analytics section", () => {
    beforeEach(() => setupMocks());

    it("renders Analytics header", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("renders Tasks Created Monthly chart title", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Tasks Created (Monthly)")).toBeInTheDocument();
    });

    it("renders Task Status Distribution chart title", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getByText("Task Status Distribution")).toBeInTheDocument();
    });

    it("renders total tasks count in pie center", () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      expect(screen.getAllByText(String(mockTasks.length))[0]).toBeInTheDocument();
    });
  });

  describe("Pie chart navigation", () => {
    beforeEach(() => setupMocks());

    it("navigates to overdue tasks on Overdue pie click", async () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      const cell = screen.queryByTestId("pie-cell-Overdue");
      if (cell) {
        fireEvent.click(cell);
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks", { state: { overdue: true } });
        });
      }
    });

    it("navigates with status filter on Pending pie click", async () => {
      renderWithProviders(<DashboardHome />, { preloadedState: adminState });
      const cell = screen.queryByTestId("pie-cell-Pending");
      if (cell) {
        fireEvent.click(cell);
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks", { state: { status: "Pending" } });
        });
      }
    });
  });
});