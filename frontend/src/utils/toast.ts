import toast from "react-hot-toast";

/* SUCCESS */
export const showSuccess = (message: string) =>
    toast.success(message, {
        duration: 3000,
        style: {
            borderRadius: "10px",
            background: "#10b981",
            color: "#fff",
            fontWeight: 500,
        },
    });

/* ERROR */
export const showError = (message: string) =>
    toast.error(message, {
        duration: 4000,
        style: {
            borderRadius: "10px",
            background: "#ef4444",
            color: "#fff",
            fontWeight: 500,
        },
    });

/* LOADING */
export const showLoading = (message: string): string =>
    toast.loading(message);

/* DISMISS */
export const dismissToast = (id?: string) => {
    if (id) toast.dismiss(id);
};