// src/__tests__/pages/Profile.test.tsx
import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders, adminState, managerState, viewerState } from "../../test-utils/testUtils.helper";

jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

let Profile: React.ComponentType;

beforeAll(async () => {
  ({ default: Profile } = await import("../../pages/Profile"));
});

describe("Profile Page", () => {
  describe("Rendering", () => {
    it("renders User Profile heading", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText(/Your account details/i)).toBeInTheDocument();
    });

    it("renders Account Information section", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Account Information")).toBeInTheDocument();
    });
  });

  describe("ADMIN user", () => {
    it("renders admin email", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText("admin@test.com").length).toBeGreaterThan(0);
    });

    it("renders ADMIN role chip", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
    });

    it("renders avatar with first letter of email", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders display name from email prefix", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
    });

    it("renders UID in info rows", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("admin-uid-123")).toBeInTheDocument();
    });
  });

  describe("MANAGER user", () => {
    it("renders MANAGER role", () => {
      renderWithProviders(<Profile />, { preloadedState: managerState });
      expect(screen.getAllByText("MANAGER").length).toBeGreaterThan(0);
    });

    it("renders manager email", () => {
      renderWithProviders(<Profile />, { preloadedState: managerState });
      expect(screen.getAllByText("manager@test.com").length).toBeGreaterThan(0);
    });
  });

  describe("VIEWER user", () => {
    it("renders VIEWER role", () => {
      renderWithProviders(<Profile />, { preloadedState: viewerState });
      expect(screen.getAllByText("VIEWER").length).toBeGreaterThan(0);
    });
  });

  describe("Account info rows", () => {
    it("renders Email Address label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("renders System Identifier label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText(/System Identifier/i)).toBeInTheDocument();
    });

    it("renders Access Level label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Access Level")).toBeInTheDocument();
    });

    it("renders Account Status label", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Account Status")).toBeInTheDocument();
    });

    it("renders Active / Verified status value", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Active / Verified")).toBeInTheDocument();
    });

    it("renders Active Session indicator", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      expect(screen.getByText("Active Session")).toBeInTheDocument();
    });
  });

  describe("Role display in Access Level row", () => {
    it("shows ADMIN in Access Level value", () => {
      renderWithProviders(<Profile />, { preloadedState: adminState });
      const accessLevelValues = screen.getAllByText("ADMIN");
      expect(accessLevelValues.length).toBeGreaterThanOrEqual(2); // chip + info row
    });
  });
});