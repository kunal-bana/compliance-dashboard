import { configureStore } from "@reduxjs/toolkit";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [],
    })
  ),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(() => "doc-ref"),
  query: jest.fn((c) => c),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({})),
  Timestamp: {
    fromDate: jest.fn((d: Date) => ({ toDate: () => d })),
    now: jest.fn(),
  },
}));

jest.mock("../../services/firebase", () => ({ db: {} }));

import { tasksApi } from "../../features/tasks/tasksApi";

function makeStore() {
  return configureStore({
    reducer: { [tasksApi.reducerPath]: tasksApi.reducer },
    middleware: (g) => g().concat(tasksApi.middleware),
  });
}

describe("tasksApi", () => {
  it("fetches tasks", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      tasksApi.endpoints.getTasks.initiate()
    ) as any;

    expect(result.data).toEqual([]);
  });
});