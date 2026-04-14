import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

import { usersApi } from "../features/users/usersApi";
import { tasksApi } from "../features/tasks/tasksApi";
import { regulationsApi } from "../features/regulations/regulationsApi";
import { entitiesApi } from "../features/entities/entitiesApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    [usersApi.reducerPath]: usersApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [regulationsApi.reducerPath]: regulationsApi.reducer,
    [entitiesApi.reducerPath]: entitiesApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(
      usersApi.middleware,
      tasksApi.middleware,
      regulationsApi.middleware,
      entitiesApi.middleware
    ),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;