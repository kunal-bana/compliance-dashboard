// src/__tests__/features/auth/authSlice.test.ts
import authReducer, { setUser, logout } from "../../../features/auth/authSlice";

describe("authSlice", () => {
  const initialState = {
    uid: null,
    email: null,
    role: null,
    isAuthenticated: false,
    isAuthChecked: false,
  };

  it("should return the initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("setUser", () => {
    it("should set ADMIN user correctly", () => {
      const payload = { uid: "uid-123", email: "admin@test.com", role: "ADMIN" as const };
      const state = authReducer(initialState, setUser(payload));

      expect(state.uid).toBe("uid-123");
      expect(state.email).toBe("admin@test.com");
      expect(state.role).toBe("ADMIN");
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
    });

    it("should set MANAGER user correctly", () => {
      const payload = { uid: "mgr-456", email: "manager@test.com", role: "MANAGER" as const };
      const state = authReducer(initialState, setUser(payload));

      expect(state.role).toBe("MANAGER");
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set VIEWER user correctly", () => {
      const payload = { uid: "vwr-789", email: "viewer@test.com", role: "VIEWER" as const };
      const state = authReducer(initialState, setUser(payload));

      expect(state.role).toBe("VIEWER");
      expect(state.isAuthenticated).toBe(true);
    });

    it("should handle null uid and email", () => {
      const payload = { uid: null, email: null, role: null };
      const state = authReducer(initialState, setUser(payload));

      expect(state.uid).toBeNull();
      expect(state.email).toBeNull();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe("logout", () => {
    it("should clear user state on logout", () => {
      const loggedInState = {
        uid: "uid-123",
        email: "admin@test.com",
        role: "ADMIN" as const,
        isAuthenticated: true,
        isAuthChecked: true,
      };

      const state = authReducer(loggedInState, logout());

      expect(state.uid).toBeNull();
      expect(state.email).toBeNull();
      expect(state.role).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(true);
    });

    it("should set isAuthChecked true even after logout", () => {
      const state = authReducer(initialState, logout());
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe("state immutability", () => {
    it("should not mutate the original state on setUser", () => {
      const stateCopy = { ...initialState };
      authReducer(initialState, setUser({ uid: "x", email: "x@x.com", role: "ADMIN" }));
      expect(initialState).toEqual(stateCopy);
    });

    it("should not mutate the original state on logout", () => {
      const loggedIn = {
        uid: "abc",
        email: "abc@test.com",
        role: "ADMIN" as const,
        isAuthenticated: true,
        isAuthChecked: true,
      };
      const copy = { ...loggedIn };
      authReducer(loggedIn, logout());
      expect(loggedIn).toEqual(copy);
    });
  });
});