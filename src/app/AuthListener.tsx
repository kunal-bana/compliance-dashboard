import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { setUser, logout } from "../features/auth/authSlice";

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(logout());
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document not found for UID:", user.uid);
          dispatch(logout());
          return;
        }

        const { role } = userSnap.data();

        if (!role) {
          console.error("User role missing in Firestore");
          dispatch(logout());
          return;
        }

        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            role, 
          })
        );
      } catch (error) {
        console.error("AuthListener error:", error);
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}