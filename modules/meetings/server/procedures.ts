import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants/constants";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schema";
import { MeetingStatus } from "../types";

export const meetingsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedMeeting] = await db
        .delete(meetings)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting Not Found",
        });
      }
      return removedMeeting;
    }),
  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedMeeting] = await db
        .update(meetings)
        .set(input)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting Not Found",
        });
      }
      return updatedMeeting;
    }),
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdMeeting] = await db
        .insert(meetings)
        .values({ ...input, userId: ctx.auth.user.id })
        .returning();

      if (!createdMeeting) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Refresh",
        });
      }
      return createdMeeting;
    }),
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
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Active,
            MeetingStatus.Upcoming,
            MeetingStatus.Cancelled,
            MeetingStatus.Processing,
            MeetingStatus.Completed,
          ])
          .nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number | null>`
          CASE
            WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (ended_at - started_at))
            ELSE NULL
          END`.as("duration"),
          total: sql<number>`count(*) over()`,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            input.search
              ? ilike(meetings.name, `%${input.search}%`)
              : undefined,
            input.status ? eq(meetings.status, input.status) : undefined,
            input.agentId ? eq(meetings.agentId, input.agentId) : undefined,
          ),
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
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
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number | null>`
          CASE
            WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (ended_at - started_at))
            ELSE NULL
          END`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(eq(meetings.userId, ctx.auth.user.id), eq(meetings.id, input.id)),
        );
      if (!data[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting Not Found",
        });
      }
      return data[0];
    }),
});
