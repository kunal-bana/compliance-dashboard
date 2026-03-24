import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    navigate("/login");
  };

  return { handleLogout };
}
