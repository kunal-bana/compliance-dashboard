import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthPayload {
  uid: string | null;
  email: string | null;
  role: "ADMIN" | "MANAGER" | "VIEWER" | null;
}

interface AuthState extends AuthPayload {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
}

const initialState: AuthState = {
  uid: null,
  email: null,
  role: null,
  isAuthenticated: false,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthPayload>) {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isAuthChecked = true;
    },
    logout(state) {
      state.uid = null;
      state.email = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isAuthChecked = true;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
