import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema, agentsUpdateSchema } from "../schema";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await db
        .select({
          ...getTableColumns(agents),
          total: sql<number>`count(*) over()`,
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            input.search ? ilike(agents.name, `%${input.search}%`) : undefined,
          ),
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);
      const total = result.length ? result[0].total : 0;
      return {
        items: result,
        total,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const data = await db
        .select()
        .from(agents)
        .where(
          and(eq(agents.userId, ctx.auth.user.id), eq(agents.id, input.id)),
        );
      if (!data[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent Not Found",
        });
      }
      return data[0];
    }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({ ...input, userId: ctx.auth.user.id })
        .returning();

      if (!createdAgent) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Refresh",
        });
      }
      return createdAgent;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedAgent] = await db
        .delete(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        )
        .returning();
      if (!removedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent Not Found",
        });
      }
      return removedAgent;
    }),

  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedAgent] = await db
        .update(agents)
        .set(input)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!updatedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent Not Found",
        });
      }
      return updatedAgent;
    }),
});
