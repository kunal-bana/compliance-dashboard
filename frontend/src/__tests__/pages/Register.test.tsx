import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

describe("Register Page", () => {
  it("renders heading and brand", () => {
    renderRegister();
    expect(screen.getByText("Complyra")).toBeInTheDocument();
    expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThan(0);
  });

  it("renders input fields", () => {
    renderRegister();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("renders button", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
  });

  it("shows validation error when empty", () => {
    renderRegister();

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument();
  });

  it("updates input fields", () => {
    renderRegister();

    const email = screen.getByLabelText(/Email Address/i);
    const password = screen.getByLabelText(/Password/i);

    fireEvent.change(email, { target: { value: "test@test.com" } });
    fireEvent.change(password, { target: { value: "password123" } });

    expect(email).toHaveValue("test@test.com");
    expect(password).toHaveValue("password123");
  });

  it("renders sign in link", () => {
    renderRegister();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});