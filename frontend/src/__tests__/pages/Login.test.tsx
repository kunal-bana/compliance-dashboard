import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/authSlice";

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

describe("Login Page", () => {
  it("renders fields", () => {
    renderLogin();

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("updates inputs", () => {
    renderLogin();

    const email = screen.getByLabelText(/Email Address/i);
    fireEvent.change(email, { target: { value: "test@test.com" } });

    expect(email).toHaveValue("test@test.com");
  });

  it("renders button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });
});