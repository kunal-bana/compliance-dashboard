import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, adminState } from "../../test-utils/testUtils.helper";

jest.mock("../../features/users/usersApi", () => ({
  useGetUsersQuery: () => ({
    data: [{ id: "1", email: "admin@test.com" }],
  }),
  useDeleteUserMutation: () => [jest.fn(), {}],
}));
jest.mock("../../theme/ThemeContext", () => ({
  useThemeMode: () => ({ mode: "light", toggleTheme: jest.fn() }),
  ThemeContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
let Settings: React.ComponentType;

beforeAll(async () => {
  ({ default: Settings } = await import("../../pages/Settings"));
});

describe("Settings Page", () => {
  it("renders headings", () => {
    renderWithProviders(<Settings />, { preloadedState: adminState });

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Security/i })).toBeInTheDocument();
  });

  it("renders password fields", () => {
    renderWithProviders(<Settings />, { preloadedState: adminState });

    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it("updates password fields", () => {
    renderWithProviders(<Settings />, { preloadedState: adminState });

    const newPwd = screen.getByLabelText(/New Password/i);
    fireEvent.change(newPwd, { target: { value: "123456" } });

    expect(newPwd).toHaveValue("123456");
  });
});