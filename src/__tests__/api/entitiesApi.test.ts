import { configureStore } from "@reduxjs/toolkit";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: "entity-1",
          data: () => ({
            name: "Acme Corp",
            type: "corporation",
            status: "Active",
            createdAt: null,
          }),
        },
        {
          id: "entity-2",
          data: () => ({
            name: "Beta LLC",
            type: "llc",
            status: "Inactive",
            createdAt: null,
          }),
        },
      ],
    })
  ),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(() => "doc-ref"),
  query: jest.fn((c) => c),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({})),
}));

jest.mock("../../services/firebase", () => ({ db: {} }));

import { entitiesApi } from "../../features/entities/entitiesApi";

function makeStore() {
  return configureStore({
    reducer: { [entitiesApi.reducerPath]: entitiesApi.reducer },
    middleware: (g) => g().concat(entitiesApi.middleware),
  });
}

describe("entitiesApi", () => {
  it("fetches entities", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      entitiesApi.endpoints.getEntities.initiate()
    ) as any;

    expect(result.data).toHaveLength(2);
  });
});