// src/__tests__/utils/testUtils.tsx
import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";

// Infer the auth state shape directly from the reducer – no import of AuthState needed
type AuthSliceState = ReturnType<typeof authReducer>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: { auth?: Partial<AuthSliceState> };
  route?: string;
}

export function makeTestStore(preloadedState?: { auth?: Partial<AuthSliceState> }) {
  return configureStore({
    reducer: { auth: authReducer } as any,
    preloadedState: preloadedState as any,
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, route = "/", ...renderOptions }: ExtendedRenderOptions = {}
) {
  const store = makeTestStore(preloadedState);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export const adminState = {
  auth: { uid: "admin-uid-123", email: "admin@test.com", role: "ADMIN" as const, isAuthenticated: true, isAuthChecked: true },
};
export const managerState = {
  auth: { uid: "manager-uid-123", email: "manager@test.com", role: "MANAGER" as const, isAuthenticated: true, isAuthChecked: true },
};
export const viewerState = {
  auth: { uid: "viewer-uid-123", email: "viewer@test.com", role: "VIEWER" as const, isAuthenticated: true, isAuthChecked: true },
};

export const mockTasks = [
  {
    id: "task-1",
    title: "Complete GDPR audit",
    description: "Audit all data processing activities",
    entityId: "entity-1",
    regulationId: "reg-1",
    assignedTo: "viewer-uid-123",
    dueDate: { toDate: () => new Date("2025-12-31"), seconds: 1767139200 },
    status: "Pending" as const,
    priority: "High" as const,
    createdBy: "admin-uid-123",
    createdAt: { toDate: () => new Date("2025-01-01"), seconds: 1735689600 },
  },
  {
    id: "task-2",
    title: "Update privacy policy",
    description: "Review and update",
    entityId: "entity-1",
    regulationId: "reg-2",
    assignedTo: "manager-uid-123",
    dueDate: { toDate: () => new Date("2020-01-01"), seconds: 1577836800 },
    status: "In Progress" as const,
    priority: "Medium" as const,
    createdBy: "admin-uid-123",
    createdAt: { toDate: () => new Date("2025-02-01"), seconds: 1738368000 },
  },
  {
    id: "task-3",
    title: "Staff training",
    description: "Conduct compliance training",
    entityId: "entity-2",
    regulationId: "reg-1",
    assignedTo: "viewer-uid-123",
    dueDate: null,
    status: "Completed" as const,
    priority: "Low" as const,
    createdBy: "manager-uid-123",
    createdAt: { toDate: () => new Date("2025-03-01"), seconds: 1740787200 },
  },
];

export const mockEntities = [
  { id: "entity-1", name: "Acme Corp", type: "corporation", status: "Active" },
  { id: "entity-2", name: "Beta LLC",  type: "llc",         status: "Inactive" },
];

export const mockRegulations = [
  { id: "reg-1", title: "GDPR",  code: "GDPR-2018",  status: "Active"   },
  { id: "reg-2", title: "HIPAA", code: "HIPAA-1996", status: "Inactive" },
];

export const mockUsers = [
  { uid: "admin-uid-123",   email: "admin@test.com",   role: "ADMIN",   status: "Active" },
  { uid: "manager-uid-123", email: "manager@test.com", role: "MANAGER", status: "Active" },
  { uid: "viewer-uid-123",  email: "viewer@test.com",  role: "VIEWER",  status: "Active" },
];