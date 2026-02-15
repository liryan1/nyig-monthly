import { prisma } from "@/lib/prisma";

async function clearEventResults(label: string, year: number) {
  try {
    // 1. Locate the event by checking its label and its related season's year
    const event = await prisma.event.findFirst({
      where: {
        label,
        season: {
          year,
        },
      },
    });

    if (!event) {
      console.log(`Event '${label}' for year ${year} was not found.`);
      return;
    }

    console.log(`Found event (ID: ${event.id}). Clearing results...`);

    // 2. Use a transaction to ensure both operations succeed or fail together
    const [deletedScores,] = await prisma.$transaction([

      // Delete all scores tied to this specific event
      prisma.score.deleteMany({
        where: {
          eventId: event.id,
        },
      }),

      // Nullify the optional 'results' string field on the event itself
      prisma.event.update({
        where: {
          id: event.id,
        },
        data: {
          results: null,
        },
      }),
    ]);

    console.log(`Successfully deleted ${deletedScores.count} score(s).`);
    console.log(`Cleared the 'results' text field for ${year} ${label}.`);

  } catch (error) {
    console.error('An error occurred while deleting the event results:', error);
  } finally {
    // Disconnect the Prisma client to prevent memory leaks
    await prisma.$disconnect();
  }
}

// Read arguments from the command line
// process.argv[2] is the first argument after the file name
console.log("process.argv:", process.argv)
const labelArg = process.argv[2];
const yearArg = parseInt(process.argv[3] ?? new Date().getFullYear(), 10);

if (!yearArg || !labelArg || isNaN(yearArg)) {
  console.error('❌ Error: Missing or invalid arguments.');
  console.info('👉 Usage: npm run script:revert-publish <label> <year>');
  process.exit(1);
}

// Execute the function dynamically
clearEventResults(labelArg, yearArg);

