import { prisma } from "@/lib/prisma";

export async function syncResultsToDb({ eventLabel, year, results }: { eventLabel: string, year: number, results: string }) {
  console.log("Syncing results to DB...");

  const season = await prisma.season.findFirst({
    where: { year },
    select: { id: true }
  });

  if (!season) {
    throw new Error(`Season for year ${year} not found in DB.`);
  }

  await prisma.event.update({
    where: {
      label_seasonId: {
        label: eventLabel,
        seasonId: season.id
      },
    },
    data: {
      results,
    },
  });

  console.log("Sync complete.");
}
