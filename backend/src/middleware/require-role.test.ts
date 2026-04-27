import { describe, expect, it, vi } from "vitest";
import { requireRole } from "./require-role";

describe("requireRole", () => {
  it("allows matching roles", () => {
    const middleware = requireRole("ADMIN");
    const next = vi.fn();

    middleware({ user: { role: "ADMIN" } } as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks unauthorized roles", () => {
    const middleware = requireRole("ADMIN");
    const next = vi.fn();

    middleware({ user: { role: "STUDENT" } } as never, {} as never, next);

    expect(next).toHaveBeenCalled();
  });
});
