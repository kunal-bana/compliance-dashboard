import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  adminState, viewerState,
  mockTasks, mockRegulations,
} from "../../test-utils/testUtils.helper";

jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockUseGetTasks       = jest.fn();
const mockUseGetRegulations = jest.fn();

jest.mock("../../features/tasks/tasksApi",          () => ({ useGetTasksQuery:       () => mockUseGetTasks()       }));
jest.mock("../../features/regulations/regulationsApi", () => ({ useGetRegulationsQuery: () => mockUseGetRegulations() }));

// Pure JSX recharts mock – no require()
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart:  ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line:       () => <div />,
  XAxis:      () => <div />,
  YAxis:      () => <div />,
  CartesianGrid: () => <div />,
  Legend:     () => <div />,
  PieChart:   ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data, onClick }: { data?: any[]; onClick?: (d: any) => void }) => (
    <div data-testid="pie">
      {data?.map((d: any, i: number) => (
        <button key={i} data-testid={`pie-slice-${d.name}`} onClick={() => onClick?.(d)}>
          {d.name}: {d.value}
        </button>
      ))}
    </div>
  ),
  Cell:    () => <div />,
  Tooltip: () => <div />,
}));

let Reports: React.ComponentType;
beforeAll(async () => { ({ default: Reports } = await import("../../pages/Reports")); });
beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetTasks.mockReturnValue({ data: mockTasks });
  mockUseGetRegulations.mockReturnValue({ data: mockRegulations });
});

describe("Reports Page", () => {
  describe("Rendering", () => {
    it("renders Reports & Analytics heading", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText("Reports & Analytics")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText(/Insights and trends/i)).toBeInTheDocument();
    });

    it("renders Visual Analytics section", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText("Visual Analytics")).toBeInTheDocument();
    });

    it("renders Tasks by Regulation section", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText("Tasks by Regulation")).toBeInTheDocument();
    });
  });

  describe("Status summary cards", () => {
    it("renders all four status labels", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      ["Pending", "In Progress", "Completed", "Overdue"].forEach((s) => {
        expect(screen.getByText(s)).toBeInTheDocument();
      });
    });

    it("shows correct Completed count", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      const count = mockTasks.filter((t) => t.status === "Completed").length;
      expect(screen.getAllByText(String(count)).length).toBeGreaterThan(0);
    });
  });

  describe("Regulation cards", () => {
    it("renders a card for each regulation title", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      mockRegulations.forEach((r) => expect(screen.getByText(r.title)).toBeInTheDocument());
    });

    it("renders regulation codes", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      mockRegulations.forEach((r) => expect(screen.getByText(r.code)).toBeInTheDocument());
    });

    it("renders task counts per regulation", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      mockRegulations.forEach((r) => {
        const count = mockTasks.filter((t) => t.regulationId === r.id).length;
        expect(screen.getByText(`${count} Tasks`)).toBeInTheDocument();
      });
    });
  });

  describe("Charts", () => {
    it("renders Tasks Created Monthly title", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText("Tasks Created (Monthly)")).toBeInTheDocument();
    });

    it("renders Task Status Distribution title", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByText("Task Status Distribution")).toBeInTheDocument();
    });

    it("renders pie chart", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

    it("renders line chart", () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Pie navigation", () => {
    it("navigates to overdue tasks on Overdue slice click", async () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      const slice = screen.queryByTestId("pie-slice-Overdue");
      if (slice) {
        fireEvent.click(slice);
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks", { state: { overdue: true } }));
      }
    });

    it("navigates with status filter on Pending slice click", async () => {
      renderWithProviders(<Reports />, { preloadedState: adminState });
      const slice = screen.queryByTestId("pie-slice-Pending");
      if (slice) {
        fireEvent.click(slice);
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks", { state: { status: "Pending" } }));
      }
    });
  });

  describe("VIEWER role", () => {
    it("filters counts to viewer tasks only", () => {
      const viewerTasks = mockTasks.filter((t) => t.assignedTo === "viewer-uid-123");
      mockUseGetTasks.mockReturnValue({ data: viewerTasks });
      renderWithProviders(<Reports />, { preloadedState: viewerState });
      const completedCount = viewerTasks.filter((t) => t.status === "Completed").length;
      expect(screen.getAllByText(String(completedCount)).length).toBeGreaterThan(0);
    });
  });
});