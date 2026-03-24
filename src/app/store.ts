import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { entitiesApi } from "../features/entities/entitiesApi";
import { regulationsApi } from "../features/regulations/regulationsApi";
import { tasksApi } from "../features/tasks/tasksApi";
import { usersApi } from "../features/users/usersApi";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [entitiesApi.reducerPath]: entitiesApi.reducer,
    [regulationsApi.reducerPath]: regulationsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "entitiesApi/executeQuery/rejected",
          "regulationsApi/executeQuery/rejected",
          "tasksApi/executeQuery/rejected",
        ],
      },
    }).concat(
      entitiesApi.middleware,
      regulationsApi.middleware,
      tasksApi.middleware,
      usersApi.middleware,  
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;