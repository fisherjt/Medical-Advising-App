// Tests for auth JWT/session callbacks and role injection logic.
// We test the callback functions in isolation — no real DB or HTTP calls.

// Mock Prisma so the generated client never initialises in jsdom
jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

import { authOptions } from "@/lib/auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callbacks = (authOptions.callbacks ?? {}) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jwtCallback: (p: any) => Promise<JWT> = callbacks.jwt;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sessionCallback: (p: any) => Promise<Session> = callbacks.session;

describe("auth JWT callback", () => {
  it("copies role from user onto token on first sign-in", async () => {
    const token: JWT = { sub: "user-123" };
    const user = { id: "user-123", email: "a@byui.edu", name: "A", role: "ADVISOR" };
    const result = await jwtCallback({ token, user });
    expect(result.role).toBe("ADVISOR");
  });

  it("preserves existing role on subsequent calls (no user param)", async () => {
    const token: JWT = { sub: "user-123", role: "STUDENT" };
    const result = await jwtCallback({ token });
    expect(result.role).toBe("STUDENT");
  });

  it("handles ADMIN role correctly", async () => {
    const token: JWT = { sub: "admin-1" };
    const user = { id: "admin-1", email: "admin@byui.edu", name: "Admin", role: "ADMIN" };
    const result = await jwtCallback({ token, user });
    expect(result.role).toBe("ADMIN");
  });
});

describe("auth session callback", () => {
  it("injects id and role from token into session.user", async () => {
    const session: Session = {
      user: { name: "Test User", email: "test@byui.edu" },
      expires: "2099-01-01",
    };
    const token: JWT = { sub: "user-456", role: "ADVISOR" };
    const result = await sessionCallback({ session, token });
    const user = result.user as { id: string; role: string };
    expect(user.id).toBe("user-456");
    expect(user.role).toBe("ADVISOR");
  });

  it("preserves original session fields", async () => {
    const session: Session = {
      user: { name: "Jane", email: "jane@byui.edu" },
      expires: "2099-01-01",
    };
    const token: JWT = { sub: "u-1", role: "STUDENT" };
    const result = await sessionCallback({ session, token });
    expect(result.user?.name).toBe("Jane");
    expect(result.user?.email).toBe("jane@byui.edu");
    expect(result.expires).toBe("2099-01-01");
  });
});

describe("authOptions config", () => {
  it("uses jwt session strategy", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("redirects to /login on sign-in", () => {
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("has a credentials provider", () => {
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("credentials");
  });
});
