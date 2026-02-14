import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type AgentGetOneResponse =
  inferRouterOutputs<AppRouter>["agents"]["getOne"];
