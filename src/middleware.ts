import type { Request, Response, NextFunction } from "express";

import { credentialSchema } from "./lib/schemas";

/** Rejects cross-origin requests and missing credentials before xmcp handles HTTP traffic. */
export default function middleware(request: Request, response: Response, next: NextFunction) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.path !== "/mcp") return next();

  const origin = request.get("origin");
  if (origin && URL.parse(origin)?.host !== request.get("host"))
    return response.status(403).send({ error: "Origin is not allowed." });

  const credentials = credentialSchema.safeParse({
    token: request.headers["x-discord-token"],
    authPrefix: request.headers["x-discord-auth-prefix"],
  });
  if (!credentials.success)
    return response.status(400).send({
      error: "Set X-Discord-Token. X-Discord-Auth-Prefix must be Bot or Bearer.",
    });
  return next();
}
