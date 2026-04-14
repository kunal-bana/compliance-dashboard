import { configureStore } from "@reduxjs/toolkit";

jest.mock("firebase/firestore", () => {
    return {
        collection: jest.fn(() => "users-collection"),
        getDocs: jest.fn(() =>
            Promise.resolve({
                docs: [],
            })
        ),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        doc: jest.fn(() => "user-doc-ref"),
    };
});

jest.mock("../../services/firebase", () => ({ db: {} }));

import { usersApi } from "../../features/users/usersApi";

function makeStore() {
    return configureStore({
        reducer: { [usersApi.reducerPath]: usersApi.reducer },
        middleware: (g) => g().concat(usersApi.middleware),
    });
}

beforeEach(() => jest.clearAllMocks());

describe("usersApi", () => {
    it("fetches users", async () => {
        const store = makeStore();
        const result = await store.dispatch(usersApi.endpoints.getUsers.initiate()) as any;
        expect(result.data).toEqual([]);
    });
});