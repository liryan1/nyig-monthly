import { prisma } from "@/lib/prisma";
import { adult, youth } from "./divisions";

const year = 2025
// const eventLabels = ['jan', 'feb', 'mar', 'may', 'jun', 'jul', 'sep', 'oct', 'nov'];
const eventLabels = ['dec'];
const rules = {
  adult,
  youth,
}

async function createSeason() {
  console.log('🌱 Starting season and events creation...');

  // Create Season with division rules
  console.log('Upserting season...');
  const season = await prisma.season.upsert({
    where: {
      year,
    },
    create: {
      year,
      rules,
    },
    update: {
      rules,
    }
  });

  // Create Events
  console.log('Creating events...');
  const eventUpserts = eventLabels.map((label, index) => {
    // Generate a dummy date for the event. Assuming first day of the month.
    // Months are 1-indexed for Date objects, so index + 1
    const month = index + 1;
    const date = new Date(Date.UTC(year, month - 1, 1)).toISOString(); // Use UTC to avoid timezone issues

    return prisma.event.upsert({
      where: {
        label_seasonId: {
          label,
          seasonId: season.id,
        }
      },
      create: {
        label,
        seasonId: season.id,
        date,
      },
      update: {
        label,
        date,
      }
    })
  })
  await Promise.all(eventUpserts)

  // Uncomment to generate players and scores
  // await generatePlayersAndScores();

  console.log('✅ Complete!');
  console.log(`   - Created ${year} season`);
  console.log(`   - Created ${eventLabels.length} events`);
}

createSeason()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
