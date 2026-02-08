import { drizzle } from "drizzle-orm/neon-http";

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE ENV VARIABLE NOT LOADED");
}

export const db = drizzle(process.env["DATABASE_URL"]);
