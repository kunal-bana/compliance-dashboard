import { configureStore } from "@reduxjs/toolkit";
import { regulationsApi } from "../../features/regulations/regulationsApi";

function makeStore() {
  return configureStore({
    reducer: { [regulationsApi.reducerPath]: regulationsApi.reducer },
    middleware: (gDM) => gDM().concat(regulationsApi.middleware),
  });
}

describe("regulationsApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify([]))
      )
    ) as jest.Mock;
  });

  it("fetches regulations", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      regulationsApi.endpoints.getRegulations.initiate(undefined)
    ) as any;

    expect(result.data).toEqual([]);
  });
});