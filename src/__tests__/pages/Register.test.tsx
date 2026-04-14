import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockCreateUser = jest.fn();
const mockSetDoc = jest.fn();
const mockNavigate = jest.fn();

jest.mock("firebase/auth", () => ({
    createUserWithEmailAndPassword: (...args: any[]) => mockCreateUser(...args),
    getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    serverTimestamp: jest.fn(() => "SERVER_TIMESTAMP"),
    getFirestore: jest.fn(),
}));

jest.mock("../../services/firebase", () => ({
    auth: {},
    db: {},
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

let Register: React.ComponentType;

function renderRegister() {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );
}

beforeAll(async () => {
    ({ default: Register } = await import("../../pages/Register"));
});

beforeEach(() => jest.clearAllMocks());

describe("Register Page", () => {
    describe("Rendering", () => {
        it("renders Complyra brand name", () => {
            renderRegister();
            expect(screen.getByText("Complyra")).toBeInTheDocument();
        });

        it("renders Create Account heading", () => {
            renderRegister();
            expect(
                screen.getByRole("heading", { name: /create account/i })
            ).toBeInTheDocument();
        });

        it("renders email and password fields", () => {
            renderRegister();
            expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        });

        it("renders Create Account button", () => {
            renderRegister();
            expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
        });

        it("renders Sign In link", () => {
            renderRegister();
            expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        });

        it("renders copyright notice", () => {
            renderRegister();
            expect(screen.getByText(/Complyra Enterprise Solutions/i)).toBeInTheDocument();
        });
    });

    describe("Password toggle", () => {
        it("password starts hidden", () => {
            renderRegister();
            expect(screen.getByLabelText(/Password/i)).toHaveAttribute("type", "password");
        });

        it("toggles password visibility", () => {
            renderRegister();
            const passwordInput = screen.getByLabelText(/Password/i);
            const buttons = screen.getAllByRole("button");
            const toggleBtn = buttons.find(
                (b) => !b.textContent?.includes("Create Account")
            );
            if (toggleBtn) {
                fireEvent.click(toggleBtn);
                expect(passwordInput).toHaveAttribute("type", "text");
            }
        });
    });

    describe("Form input", () => {
        it("updates email on change", async () => {
            renderRegister();
            const emailInput = screen.getByLabelText(/Email Address/i);
            await userEvent.type(emailInput, "newuser@test.com");
            expect(emailInput).toHaveValue("newuser@test.com");
        });

        it("updates password on change", async () => {
            renderRegister();
            const passwordInput = screen.getByLabelText(/Password/i);
            await userEvent.type(passwordInput, "password123");
            expect(passwordInput).toHaveValue("password123");
        });
    });

    describe("Successful registration", () => {
        it("creates user and sets Firestore doc, then navigates to /login", async () => {
            mockCreateUser.mockResolvedValueOnce({
                user: { uid: "new-uid", email: "new@test.com" },
            });
            mockSetDoc.mockResolvedValueOnce(undefined);

            renderRegister();
            await userEvent.type(screen.getByLabelText(/Email Address/i), "new@test.com");
            await userEvent.type(screen.getByLabelText(/Password/i), "password123");
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                expect(mockCreateUser).toHaveBeenCalledWith({}, "new@test.com", "password123");
                expect(mockSetDoc).toHaveBeenCalled();
                expect(mockNavigate).toHaveBeenCalledWith("/login");
            });
        });

        it("creates user doc with VIEWER role", async () => {
            mockCreateUser.mockResolvedValueOnce({
                user: { uid: "new-uid", email: "new@test.com" },
            });
            mockSetDoc.mockResolvedValueOnce(undefined);

            renderRegister();
            await userEvent.type(screen.getByLabelText(/Email Address/i), "new@test.com");
            await userEvent.type(screen.getByLabelText(/Password/i), "password123");
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                const callArgs = mockSetDoc.mock.calls[0];
                expect(callArgs[1]).toMatchObject({ role: "VIEWER" });
            });
        });
    });

    describe("Registration errors", () => {
        it("shows error when email already in use", async () => {
            mockCreateUser.mockRejectedValueOnce({ code: "auth/email-already-in-use" });

            renderRegister();
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                expect(screen.getByText(/already registered/i)).toBeInTheDocument();
            });
        });

        it("shows error for weak password", async () => {
            mockCreateUser.mockRejectedValueOnce({ code: "auth/weak-password" });

            renderRegister();
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
            });
        });

        it("shows error for invalid email", async () => {
            mockCreateUser.mockRejectedValueOnce({ code: "auth/invalid-email" });

            renderRegister();
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
            });
        });

        it("shows generic error for unknown codes", async () => {
            mockCreateUser.mockRejectedValueOnce({ code: "auth/unknown" });

            renderRegister();
            fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

            await waitFor(() => {
                expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
            });
        });
    });

    describe("Loading state", () => {
        it("disables button while submitting", async () => {
            mockCreateUser.mockImplementationOnce(
                () => new Promise((res) => setTimeout(() => res({ user: { uid: "x", email: "x@x.com" } }), 500))
            );
            mockSetDoc.mockResolvedValue(undefined);

            renderRegister();
            const btn = screen.getByRole("button", { name: /Create Account/i });
            fireEvent.click(btn);

            await waitFor(() => expect(btn).toBeDisabled());
        });
    });
});