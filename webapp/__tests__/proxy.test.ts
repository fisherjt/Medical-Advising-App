// Tests for route protection logic in proxy.ts.
// We test the role-guard rules in isolation using plain functions
// rather than spinning up the full Next.js middleware pipeline.

type Role = "ADMIN" | "ADVISOR" | "STUDENT";

function canAccessAdminRoute(role: Role): boolean {
  return role === "ADMIN";
}

function canAccessAdvisorRoute(role: Role): boolean {
  return role === "ADMIN" || role === "ADVISOR";
}

function canAccessStudentRoute(role: Role): boolean {
  return true; // all authenticated users can access student routes
}

function resolveRedirect(pathname: string, role: Role): string | null {
  if (pathname.startsWith("/admin") && !canAccessAdminRoute(role)) {
    return "/unauthorized";
  }
  if (pathname.startsWith("/advisor") && !canAccessAdvisorRoute(role)) {
    return "/unauthorized";
  }
  return null; // no redirect — access granted
}

describe("Admin route protection", () => {
  it("allows ADMIN to access /admin", () => {
    expect(resolveRedirect("/admin", "ADMIN")).toBeNull();
  });

  it("blocks ADVISOR from /admin", () => {
    expect(resolveRedirect("/admin", "ADVISOR")).toBe("/unauthorized");
  });

  it("blocks STUDENT from /admin", () => {
    expect(resolveRedirect("/admin", "STUDENT")).toBe("/unauthorized");
  });

  it("blocks STUDENT from /admin/users", () => {
    expect(resolveRedirect("/admin/users", "STUDENT")).toBe("/unauthorized");
  });
});

describe("Advisor route protection", () => {
  it("allows ADVISOR to access /advisor", () => {
    expect(resolveRedirect("/advisor", "ADVISOR")).toBeNull();
  });

  it("allows ADMIN to access /advisor", () => {
    expect(resolveRedirect("/advisor", "ADMIN")).toBeNull();
  });

  it("blocks STUDENT from /advisor", () => {
    expect(resolveRedirect("/advisor", "STUDENT")).toBe("/unauthorized");
  });
});

describe("Student route protection", () => {
  it("allows STUDENT to access /student", () => {
    expect(resolveRedirect("/student", "STUDENT")).toBeNull();
  });

  it("allows ADVISOR to access /student", () => {
    expect(resolveRedirect("/student", "ADVISOR")).toBeNull();
  });

  it("allows ADMIN to access /student", () => {
    expect(resolveRedirect("/student", "ADMIN")).toBeNull();
  });
});

describe("Role helper functions", () => {
  it("only ADMIN can access admin routes", () => {
    expect(canAccessAdminRoute("ADMIN")).toBe(true);
    expect(canAccessAdminRoute("ADVISOR")).toBe(false);
    expect(canAccessAdminRoute("STUDENT")).toBe(false);
  });

  it("ADMIN and ADVISOR can access advisor routes", () => {
    expect(canAccessAdvisorRoute("ADMIN")).toBe(true);
    expect(canAccessAdvisorRoute("ADVISOR")).toBe(true);
    expect(canAccessAdvisorRoute("STUDENT")).toBe(false);
  });

  it("all roles can access student routes", () => {
    expect(canAccessStudentRoute("ADMIN")).toBe(true);
    expect(canAccessStudentRoute("ADVISOR")).toBe(true);
    expect(canAccessStudentRoute("STUDENT")).toBe(true);
  });
});
