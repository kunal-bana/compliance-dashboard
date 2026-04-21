import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout } from "../features/auth/authSlice";

export function useAuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(logout());
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      dispatch(
        setUser({
          uid: payload.id,
          email: payload.email || null,
          role: payload.role,
        })
      );
    } catch {
      dispatch(logout());
    }
  }, [dispatch]);
}