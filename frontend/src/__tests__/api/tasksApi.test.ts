import { configureStore } from "@reduxjs/toolkit";
import { tasksApi } from "../../features/tasks/tasksApi";

function makeStore() {
  return configureStore({
    reducer: { [tasksApi.reducerPath]: tasksApi.reducer },
    middleware: (gDM) => gDM().concat(tasksApi.middleware),
  });
}

describe("tasksApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify([]))
      )
    ) as jest.Mock;
  });

  it("fetches tasks", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      tasksApi.endpoints.getTasks.initiate(undefined)
    ) as any;

    expect(result.data).toEqual([]);
  });
});