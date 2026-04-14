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
}));

jest.mock("../../services/firebase", () => ({ db: {} }));

import { regulationsApi } from "../../features/regulations/regulationsApi";

function makeStore() {
  return configureStore({
    reducer: { [regulationsApi.reducerPath]: regulationsApi.reducer },
    middleware: (g) => g().concat(regulationsApi.middleware),
  });
}

describe("regulationsApi", () => {
  it("fetches regulations", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      regulationsApi.endpoints.getRegulations.initiate()
    ) as any;

    expect(result.data).toEqual([]);
  });
});