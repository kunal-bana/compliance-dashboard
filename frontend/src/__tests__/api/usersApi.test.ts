import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../../features/users/usersApi";

function makeStore() {
  return configureStore({
    reducer: { [userApi.reducerPath]: userApi.reducer },
    middleware: (gDM) => gDM().concat(userApi.middleware),
  });
}

describe("userApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify([]))
      )
    ) as jest.Mock;
  });

  it("fetches users", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      userApi.endpoints.getUsers.initiate(undefined)
    ) as any;

    expect(result.data).toEqual([]);
  });
});