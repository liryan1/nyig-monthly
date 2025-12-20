import { prisma } from "@/lib/prisma";
import { UnifiedPlayerResult } from "./models";

interface SyncOptions {
  eventLabel: string;
  year: number;
  isYouth?: boolean;
  isDryRun?: boolean;
}

/**
 * Syncs tournament results to the database. 
 * Creates participants if missing and records scores.
 */
export async function syncStandingsToDb(
  results: UnifiedPlayerResult[],
  options: SyncOptions
): Promise<void> {
  const { eventLabel, year, isDryRun, isYouth } = options;

  // 1. Find Event and Season ID
  const event = await prisma.event.findFirst({
    where: {
      label: eventLabel,
      season: { year }
    },
    select: { id: true }
  });

  if (!event) {
    throw new Error(`Event "${eventLabel}" for year ${year} not found in DB.`);
  }

  console.log(`${isDryRun ? "[DRY RUN] " : ""}Syncing ${results.length} scores...`);

  for (const player of results) {
    if (isDryRun) {
      console.log(`[DRY RUN] Participant: ${player.fullName} (AGA: ${player.agaId}), Score: ${player.score}`);
      console.log(player)
      continue;
    }


    // 2. Upsert Participant
    const participant = await prisma.participant.upsert({
      where: { agaId: player.agaId },
      update: {
        rankInt: player.rankInt,
      },
      create: {
        agaId: player.agaId,
        name: player.fullName,
        rankInt: player.rankInt,
        isYouth: !!isYouth,
      }
    });

    // 3. Create or Update Score
    await prisma.score.upsert({
      where: {
        agaId_eventId: {
          agaId: participant.agaId,
          eventId: event.id
        }
      },
      update: { value: player.score },
      create: {
        value: player.score,
        agaId: participant.agaId,
        eventId: event.id
      }
    });
  }

  console.log("Sync complete.");
}
