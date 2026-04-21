import { configureStore } from "@reduxjs/toolkit";
import { entitiesApi } from "../../features/entities/entitiesApi";

function makeStore() {
  return configureStore({
    reducer: { [entitiesApi.reducerPath]: entitiesApi.reducer },
    middleware: (gDM) => gDM().concat(entitiesApi.middleware),
  });
}

describe("entitiesApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            { _id: "1", name: "Acme Corp" },
            { _id: "2", name: "Beta LLC" },
          ])
        )
      )
    ) as jest.Mock;
  });

  it("fetches entities", async () => {
    const store = makeStore();

    const result = await store.dispatch(
      entitiesApi.endpoints.getEntities.initiate(undefined)
    ) as any;

    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe("1");
  });
});