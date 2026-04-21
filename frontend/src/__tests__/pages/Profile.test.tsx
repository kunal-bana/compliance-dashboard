import React from "react";
import { screen } from "@testing-library/react";
import {
  renderWithProviders,
  adminState,
  managerState,
  viewerState,
} from "../../test-utils/testUtils.helper";

// Theme mock
jest.mock("../../theme/ThemeContext", () => ({
  useThemeMode: () => ({ mode: "light", toggleTheme: jest.fn() }),
  ThemeContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ✅ MOCK PROFILE API
const mockUseGetProfile = jest.fn();

jest.mock("../../features/users/usersApi", () => ({
  useGetProfileQuery: () => mockUseGetProfile(),
}));

let Profile: React.ComponentType;

beforeAll(async () => {
  ({ default: Profile } = await import("../../pages/Profile"));
});

describe("Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders User Profile heading", () => {
      mockUseGetProfile.mockReturnValue({
        data: { email: "admin@test.com", role: "ADMIN", id: "admin-uid-123" },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      mockUseGetProfile.mockReturnValue({
        data: { email: "admin@test.com", role: "ADMIN", id: "admin-uid-123" },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText(/Your account details/i)).toBeInTheDocument();
    });

    it("renders Account Information section", () => {
      mockUseGetProfile.mockReturnValue({
        data: { email: "admin@test.com", role: "ADMIN", id: "admin-uid-123" },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: adminState });

      expect(screen.getByText("Account Information")).toBeInTheDocument();
    });
  });

  describe("ADMIN user", () => {
    beforeEach(() => {
      mockUseGetProfile.mockReturnValue({
        data: {
          email: "admin@test.com",
          role: "ADMIN",
          id: "admin-uid-123",
        },
        isLoading: false,
      });
    });

    it("renders admin email", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText("admin@test.com").length).toBeGreaterThan(0);
    });

    it("renders ADMIN role", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
    });

    it("renders avatar letter", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders UID", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("admin-uid-123")).toBeInTheDocument();
    });
  });

  describe("MANAGER user", () => {
    it("renders MANAGER role", () => {
      mockUseGetProfile.mockReturnValue({
        data: {
          email: "manager@test.com",
          role: "MANAGER",
          id: "manager-uid-123",
        },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: managerState });
      expect(screen.getAllByText("MANAGER").length).toBeGreaterThan(0);
    });

    it("renders manager email", () => {
      mockUseGetProfile.mockReturnValue({
        data: {
          email: "manager@test.com",
          role: "MANAGER",
          id: "manager-uid-123",
        },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: managerState });
      expect(screen.getAllByText("manager@test.com").length).toBeGreaterThan(0);
    });
  });

  describe("VIEWER user", () => {
    it("renders VIEWER role", () => {
      mockUseGetProfile.mockReturnValue({
        data: {
          email: "viewer@test.com",
          role: "VIEWER",
          id: "viewer-uid-123",
        },
        isLoading: false,
      });

      renderWithProviders(<Profile />, { preloadedState: viewerState });
      expect(screen.getAllByText("VIEWER").length).toBeGreaterThan(0);
    });
  });

  describe("Account info labels", () => {
    beforeEach(() => {
      mockUseGetProfile.mockReturnValue({
        data: {
          email: "admin@test.com",
          role: "ADMIN",
          id: "admin-uid-123",
        },
        isLoading: false,
      });
    });

    it("renders Email label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
    });

    it("renders Identifier label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText(/Identifier/i)).toBeInTheDocument();
    });

    it("renders Access Level label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText(/Access/i).length).toBeGreaterThan(0);
    });
  });
});