import type { Response } from "express";

/** Cookie that carries the signed admin session token. */
export const AUTH_COOKIE = "mrd_token";

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 86_400_000,
  });
}
