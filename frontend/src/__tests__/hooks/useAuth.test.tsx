import React from "react";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { makeTestStore } from "../../test-utils/testUtils.helper";

const mockSignOut = jest.fn();
const mockNavigate = jest.fn();
import { useAuth } from "../../hooks/useAuth";
const loggedInPreload = {
  auth: { uid: "u1", email: "u@test.com", role: "ADMIN" as const, isAuthenticated: true, isAuthChecked: true },
};

function makeWrapper(preload?: typeof loggedInPreload) {
  const store = makeTestStore(preload);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  };
}
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
beforeEach(() => jest.clearAllMocks());

describe("useAuth hook", () => {
  it("returns a handleLogout function", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(loggedInPreload) });
    expect(typeof result.current.handleLogout).toBe("function");
  });

  it("calls firebase signOut on handleLogout", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(loggedInPreload) });
    await act(async () => { await result.current.handleLogout(); });
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("navigates to /login after logout", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });
    await act(async () => { await result.current.handleLogout(); });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});