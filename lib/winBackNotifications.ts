import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendWebPush } from "@/lib/webPush";

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCK_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export type WinBackSummary = {
  dryRun: boolean;
  eligible7Day: number;
  eligible14Day: number;
  selected7Day: number;
  selected14Day: number;
  attempted: number;
  delivered: number;
  failed: number;
  removed: number;
  skipped: number;
  advancedToStage1: number;
  advancedToStage2: number;
  stageAdvanceMisses: number;
};

type Candidate = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function sevenDayWhere(now: Date): Prisma.WebPushSubscriptionWhereInput {
  return {
    enabled: true,
    learningReminders: true,
    winBackStage: 0,
    lastSeenAt: {
      lte: new Date(now.getTime() - 7 * DAY_MS),
    },
    OR: [
      { winBackLockUntil: null },
      {
        winBackLockUntil: {
          lte: now,
        },
      },
    ],
  };
}

function fourteenDayWhere(
  now: Date,
): Prisma.WebPushSubscriptionWhereInput {
  return {
    enabled: true,
    learningReminders: true,
    winBackStage: 1,
    lastSeenAt: {
      lte: new Date(now.getTime() - 14 * DAY_MS),
    },
    lastWinBackAt: {
      lte: new Date(now.getTime() - 6 * DAY_MS),
    },
    OR: [
      { winBackLockUntil: null },
      {
        winBackLockUntil: {
          lte: now,
        },
      },
    ],
  };
}

async function claimCandidate(
  candidate: Candidate,
  stage: 0 | 1,
  now: Date,
) {
  const lockUntil = new Date(now.getTime() + LOCK_MS);
  const lockToken = randomUUID();
  const eligibility = stage === 0 ? sevenDayWhere(now) : fourteenDayWhere(now);

  const result = await db.webPushSubscription.updateMany({
    where: {
      id: candidate.id,
      ...eligibility,
    },
    data: {
      winBackLockUntil: lockUntil,
      winBackLockToken: lockToken,
    },
  });

  return {
    claimed: result.count === 1,
    lockUntil,
    lockToken,
  };
}

async function releaseLock(candidateId: string, lockToken: string) {
  await db.webPushSubscription.updateMany({
    where: {
      id: candidateId,
      winBackLockToken: lockToken,
    },
    data: {
      winBackLockUntil: null,
      winBackLockToken: null,
    },
  });
}

async function advanceStage({
  candidateId,
  currentStage,
  lockToken,
  now,
}: {
  candidateId: string;
  currentStage: 0 | 1;
  lockToken: string;
  now: Date;
}) {
  const nextStage = currentStage === 0 ? 1 : 2;

  return db.webPushSubscription.updateMany({
    where: {
      id: candidateId,
      enabled: true,
      learningReminders: true,
      winBackStage: currentStage,
      winBackLockToken: lockToken,

      /*
       * If the reader returned between the push provider accepting the message
       * and this write, /api/push/activity clears the lock token. That makes
       * this update safely miss instead of putting an active reader back into
       * an inactive stage.
       */
    },
    data: {
      winBackStage: nextStage,
      lastWinBackAt: now,
      winBackLockUntil: null,
      winBackLockToken: null,
    },
  });
}

function createPayload(stage: 0 | 1) {
  const pushId = randomUUID();

  if (stage === 0) {
    return {
      title: "Your next breakthrough might be one article away 👀",
      body: "You’ve been away from Tech Path for a week. Fresh tutorials and developer insights are waiting — come see what you missed.",
      url: "/blog/feed/1",
      tag: "tech-path-win-back-7d",
      type: "winback" as const,
      campaign: "win_back_7d",
      pushId,
    };
  }

  return {
    title: "Two weeks away? Let’s fix that 🚀",
    body: "New developer guides, practical lessons and fresh ideas have landed on Tech Path. Pick up where you left off.",
    url: "/blog/feed/1",
    tag: "tech-path-win-back-14d",
    type: "winback" as const,
    campaign: "win_back_14d",
    pushId,
  };
}

function emptySummary(
  dryRun: boolean,
  eligible7Day: number,
  eligible14Day: number,
): WinBackSummary {
  return {
    dryRun,
    eligible7Day,
    eligible14Day,
    selected7Day: 0,
    selected14Day: 0,
    attempted: 0,
    delivered: 0,
    failed: 0,
    removed: 0,
    skipped: 0,
    advancedToStage1: 0,
    advancedToStage2: 0,
    stageAdvanceMisses: 0,
  };
}

export async function runTechPathWinBackNotifications({
  dryRun = false,
  limit = DEFAULT_LIMIT,
}: {
  dryRun?: boolean;
  limit?: number;
} = {}): Promise<WinBackSummary> {
  const now = new Date();
  const safeLimit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
  const where7 = sevenDayWhere(now);
  const where14 = fourteenDayWhere(now);

  const [eligible7Day, eligible14Day] = await Promise.all([
    db.webPushSubscription.count({ where: where7 }),
    db.webPushSubscription.count({ where: where14 }),
  ]);

  if (dryRun) {
    return emptySummary(true, eligible7Day, eligible14Day);
  }

  const stage14Candidates = await db.webPushSubscription.findMany({
    where: where14,
    orderBy: {
      lastSeenAt: "asc",
    },
    take: safeLimit,
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });

  const remaining = Math.max(0, safeLimit - stage14Candidates.length);
  const stage7Candidates = remaining
    ? await db.webPushSubscription.findMany({
        where: where7,
        orderBy: {
          lastSeenAt: "asc",
        },
        take: remaining,
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      })
    : [];

  const summary = emptySummary(false, eligible7Day, eligible14Day);
  summary.selected7Day = stage7Candidates.length;
  summary.selected14Day = stage14Candidates.length;

  async function deliver(candidate: Candidate, stage: 0 | 1) {
    const claim = await claimCandidate(candidate, stage, now);

    if (!claim.claimed) {
      summary.skipped += 1;
      return;
    }

    summary.attempted += 1;

    try {
      const result = await sendWebPush(
        {
          endpoint: candidate.endpoint,
          p256dh: candidate.p256dh,
          auth: candidate.auth,
        },
        createPayload(stage),
      );

      if (result.stale) {
        await db.webPushSubscription.deleteMany({
          where: {
            id: candidate.id,
          },
        });

        summary.removed += 1;
        return;
      }

      if (!result.delivered) {
        await releaseLock(candidate.id, claim.lockToken);
        summary.failed += 1;
        return;
      }

      summary.delivered += 1;

      const advanced = await advanceStage({
        candidateId: candidate.id,
        currentStage: stage,
        lockToken: claim.lockToken,
        now,
      });

      if (advanced.count === 1) {
        if (stage === 0) {
          summary.advancedToStage1 += 1;
        } else {
          summary.advancedToStage2 += 1;
        }
      } else {
        summary.stageAdvanceMisses += 1;

        console.warn(
          `Tech Path win-back was delivered but stage was not advanced for subscription ${candidate.id}. ` +
            "The reader may have returned during delivery, or the lifecycle row changed concurrently.",
        );
      }
    } catch (error) {
      console.error("Tech Path win-back delivery failed:", error);
      await releaseLock(candidate.id, claim.lockToken).catch(() => undefined);
      summary.failed += 1;
    }
  }

  // Prioritize users who are due for the final 14-day reminder.
  for (const candidate of stage14Candidates) {
    await deliver(candidate, 1);
  }

  for (const candidate of stage7Candidates) {
    await deliver(candidate, 0);
  }

  return summary;
}
