import { z } from "zod";

export const ContributionDaySchema = z.object({
  date: z.string(),              // ISO date
  contributionCount: z.number()
});

export const WeekSchema = z.object({
  contributionDays: z.array(ContributionDaySchema)
});

export const ContributionCalendarSchema = z.object({
  totalContributions: z.number(),
  weeks: z.array(WeekSchema)
});

export const GitHubResponseSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: ContributionCalendarSchema
      })
    })
  })
});
