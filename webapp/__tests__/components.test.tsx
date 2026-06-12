import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SignOutButton from "@/components/SignOutButton";
import SessionProvider from "@/components/SessionProvider";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { signOut } from "next-auth/react";

describe("SignOutButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders a Sign Out button", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls signOut with /login callbackUrl when clicked", () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("calls signOut exactly once per click", () => {
    render(<SignOutButton />);
    const btn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(signOut).toHaveBeenCalledTimes(2);
  });
});

describe("SessionProvider", () => {
  it("renders children", () => {
    render(
      <SessionProvider session={null}>
        <div data-testid="child">Hello</div>
      </SessionProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders children with a real session object", () => {
    const session = {
      user: { name: "Test User", email: "test@byui.edu" },
      expires: "2099-01-01",
    };
    render(
      <SessionProvider session={session}>
        <span data-testid="inner">content</span>
      </SessionProvider>
    );
    expect(screen.getByTestId("inner")).toHaveTextContent("content");
  });
});
