import React from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeTestStore } from "../../test-utils/testUtils.helper";

jest.mock("../../services/firebase", () => ({ auth: {}, db: {} }));

jest.mock("../../config/permissions", () => ({
  PERMISSIONS: {
    ENTITY: {
      create: ["ADMIN", "MANAGER"],
      update: ["ADMIN", "MANAGER"],
      delete: ["ADMIN"],
      read:   ["ADMIN", "MANAGER", "VIEWER"],
    },
    REGULATION: {
      create: ["ADMIN", "MANAGER"],
      update: ["ADMIN", "MANAGER"],
      delete: ["ADMIN"],
      read:   ["ADMIN", "MANAGER", "VIEWER"],
    },
    TASK: {
      create: ["ADMIN", "MANAGER"],
      update: ["ADMIN", "MANAGER"],
      delete: ["ADMIN"],
      read:   ["ADMIN", "MANAGER", "VIEWER"],
    },
    USER: {
      create: ["ADMIN"],
      update: ["ADMIN"],
      delete: ["ADMIN"],
      read:   ["ADMIN", "MANAGER"],
    },
  },
}));

import { usePermission } from "../../hooks/usePermission";

function makeWrapper(role: "ADMIN" | "MANAGER" | "VIEWER" | null) {
  const store = makeTestStore({
    auth: { uid: "t", email: "t@t.com", role: role ?? undefined, isAuthenticated: true, isAuthChecked: true } as any,
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function useP(feature: any, action: any) {
  return usePermission(feature, action);
}

describe("usePermission hook", () => {
  describe("ADMIN", () => {
    it("grants create on ENTITY",     () => { const { result } = renderHook(() => useP("ENTITY", "create"), { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
    it("grants delete on ENTITY",     () => { const { result } = renderHook(() => useP("ENTITY", "delete"), { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
    it("grants create on USER",       () => { const { result } = renderHook(() => useP("USER",   "create"), { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
    it("grants read on USER",         () => { const { result } = renderHook(() => useP("USER",   "read"),   { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
    it("grants read on TASK",         () => { const { result } = renderHook(() => useP("TASK",   "read"),   { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
    it("grants delete on REGULATION", () => { const { result } = renderHook(() => useP("REGULATION", "delete"), { wrapper: makeWrapper("ADMIN") }); expect(result.current).toBe(true); });
  });

  describe("MANAGER", () => {
    it("grants create on ENTITY",     () => { const { result } = renderHook(() => useP("ENTITY", "create"), { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(true); });
    it("denies  delete on ENTITY",    () => { const { result } = renderHook(() => useP("ENTITY", "delete"), { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(false); });
    it("denies  create on USER",      () => { const { result } = renderHook(() => useP("USER",   "create"), { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(false); });
    it("grants read on USER",         () => { const { result } = renderHook(() => useP("USER",   "read"),   { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(true); });
    it("grants create on TASK",       () => { const { result } = renderHook(() => useP("TASK",   "create"), { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(true); });
    it("denies  delete on REGULATION",() => { const { result } = renderHook(() => useP("REGULATION", "delete"), { wrapper: makeWrapper("MANAGER") }); expect(result.current).toBe(false); });
  });

  describe("VIEWER", () => {
    it("grants read on ENTITY",       () => { const { result } = renderHook(() => useP("ENTITY", "read"),   { wrapper: makeWrapper("VIEWER") }); expect(result.current).toBe(true); });
    it("denies  create on ENTITY",    () => { const { result } = renderHook(() => useP("ENTITY", "create"), { wrapper: makeWrapper("VIEWER") }); expect(result.current).toBe(false); });
    it("denies  delete on ENTITY",    () => { const { result } = renderHook(() => useP("ENTITY", "delete"), { wrapper: makeWrapper("VIEWER") }); expect(result.current).toBe(false); });
    it("denies  read on USER",        () => { const { result } = renderHook(() => useP("USER",   "read"),   { wrapper: makeWrapper("VIEWER") }); expect(result.current).toBe(false); });
    it("denies  create on TASK",      () => { const { result } = renderHook(() => useP("TASK",   "create"), { wrapper: makeWrapper("VIEWER") }); expect(result.current).toBe(false); });
  });

  describe("null role (unauthenticated)", () => {
    it("denies all permissions", () => {
      const { result } = renderHook(() => useP("ENTITY", "read"), { wrapper: makeWrapper(null) });
      expect(result.current).toBe(false);
    });
  });
});