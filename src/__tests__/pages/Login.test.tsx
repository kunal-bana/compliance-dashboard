import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/authSlice";

//  Firebase mocks 
const mockSignIn = jest.fn();
const mockGetDocs = jest.fn();
const mockNavigate = jest.fn();

jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: (...args: any[]) => mockSignIn(...args),
    getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock("../../services/firebase", () => ({
    auth: {},
    db: {},
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
}));

// Lazy import so mocks are set up first
let Login: React.ComponentType;

function renderLogin() {
    const store = configureStore({ reducer: { auth: authReducer } });
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </Provider>
    );
}

beforeAll(async () => {
    ({ default: Login } = await import("../../pages/Login"));
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Login Page", () => {
    describe("Rendering", () => {
        it("renders brand name", () => {
            renderLogin();
            expect(screen.getByText("Complyra")).toBeInTheDocument();
        });

        it("renders enterprise subtitle", () => {
            renderLogin();
            expect(screen.getByText(/Enterprise Compliance Platform/i)).toBeInTheDocument();
        });

        it("renders welcome back heading", () => {
            renderLogin();
            expect(screen.getByText("Welcome back")).toBeInTheDocument();
        });

        it("renders email and password fields", () => {
            renderLogin();
            expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        });

        it("renders sign in button", () => {
            renderLogin();
            expect(screen.getByRole("button", { name: /Sign In to Dashboard/i })).toBeInTheDocument();
        });

        it("renders sign up link", () => {
            renderLogin();
            expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
        });

        it("renders copyright notice", () => {
            renderLogin();
            expect(screen.getByText(/Complyra Enterprise Solutions/i)).toBeInTheDocument();
        });
    });

    describe("Password visibility toggle", () => {
        it("password field starts as type password", () => {
            renderLogin();
            const passwordInput = screen.getByLabelText(/^Password/i);
            expect(passwordInput).toHaveAttribute("type", "password");
        });

        it("toggles password visibility on icon click", async () => {
            renderLogin();
            const passwordInput = screen.getByLabelText(/^Password/i);
            const toggleButtons = screen.getAllByRole("button");
            const visibilityBtn = toggleButtons.find(
                (btn) => btn.querySelector('svg') && !btn.textContent?.includes("Sign In")
            );

            expect(passwordInput).toHaveAttribute("type", "password");
            if (visibilityBtn) {
                fireEvent.click(visibilityBtn);
                expect(passwordInput).toHaveAttribute("type", "text");
                fireEvent.click(visibilityBtn);
                expect(passwordInput).toHaveAttribute("type", "password");
            }
        });
    });

    describe("Form input", () => {
        it("updates email field on change", async () => {
            renderLogin();
            const emailInput = screen.getByLabelText(/Email Address/i);
            await userEvent.type(emailInput, "test@example.com");
            expect(emailInput).toHaveValue("test@example.com");
        });

        it("updates password field on change", async () => {
            renderLogin();
            const passwordInput = screen.getByLabelText(/^Password/i);
            await userEvent.type(passwordInput, "secret123");
            expect(passwordInput).toHaveValue("secret123");
        });
    });

    describe("Form submission – success", () => {
        it("calls signInWithEmailAndPassword with correct args and navigates", async () => {
            mockSignIn.mockResolvedValueOnce({
                user: { uid: "u1", email: "admin@test.com" },
            });

            mockGetDocs.mockResolvedValueOnce({
                docs: [{ data: () => ({ role: "ADMIN" }) }],
            });

            renderLogin();
            await userEvent.type(screen.getByLabelText(/Email Address/i), "admin@test.com");
            await userEvent.type(screen.getByLabelText(/^Password/i), "password123");
            fireEvent.click(screen.getByRole("button", { name: /Sign In to Dashboard/i }));

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith({}, "admin@test.com", "password123");
                expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
            });
        });
    });

    describe("Form submission – errors", () => {
        it("shows error on invalid credential", async () => {
            mockSignIn.mockRejectedValueOnce({ code: "auth/invalid-credential" });

            renderLogin();
            await userEvent.type(screen.getByLabelText(/Email Address/i), "bad@test.com");
            await userEvent.type(screen.getByLabelText(/^Password/i), "wrongpass");
            fireEvent.click(screen.getByRole("button", { name: /Sign In to Dashboard/i }));

            await waitFor(() => {
                expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
            });
        });

        it("shows generic error on unknown error code", async () => {
            mockSignIn.mockRejectedValueOnce({ code: "auth/network-request-failed" });

            renderLogin();
            fireEvent.click(screen.getByRole("button", { name: /Sign In to Dashboard/i }));

            await waitFor(() => {
                expect(screen.getByText(/Login failed. Try again/i)).toBeInTheDocument();
            });
        });

        it("shows error on wrong password", async () => {
            mockSignIn.mockRejectedValueOnce({ code: "auth/wrong-password" });

            renderLogin();
            fireEvent.click(screen.getByRole("button", { name: /Sign In to Dashboard/i }));

            await waitFor(() => {
                expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
            });
        });

        it("shows error on user not found", async () => {
            mockSignIn.mockRejectedValueOnce({ code: "auth/user-not-found" });

            renderLogin();
            fireEvent.click(screen.getByRole("button", { name: /Sign In to Dashboard/i }));

            await waitFor(() => {
                expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
            });
        });
    });

    describe("Loading state", () => {
        it("disables button while loading", async () => {
            mockSignIn.mockImplementationOnce(
                () => new Promise((res) => setTimeout(() => res({ user: { uid: "u1", email: "a@b.com" } }), 500))
            );
            mockGetDocs.mockResolvedValue({ docs: [{ data: () => ({ role: "ADMIN" }) }] });

            renderLogin();
            const btn = screen.getByRole("button", { name: /Sign In to Dashboard/i });
            fireEvent.click(btn);

            await waitFor(() => {
                expect(btn).toBeDisabled();
            });
        });
    });
});