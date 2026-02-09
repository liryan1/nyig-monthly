import { prisma } from "@/lib/prisma";

const existingAgaIds = new Set()
const year = 2026
const eventLabels = ['jan', 'feb', 'mar', 'may', 'jun', 'jul', 'sep', 'oct', 'nov'];
const rules = {
  adult: [
    { label: 'High Dan', min: 3, max: 8, isYouth: false },
    { label: 'Dan', min: 0, max: 2, isYouth: false },
    { label: 'Single-digit kyu', min: -9, max: -1, isYouth: false },
    { label: 'Double-digit kyu', min: -30, max: -10, isYouth: false }
  ],
  youth: [
    { label: 'Dan', min: 0, max: 8, isYouth: true },
    { label: 'Single-digit kyu', min: -9, max: -1, isYouth: true },
    { label: 'Double-digit kyu A', min: -17, max: -10, isYouth: true },
    { label: 'Double-digit kyu B', min: -30, max: -18, isYouth: true }
  ]
}

async function seed() {
  console.log('🌱 Starting seed...');

  // DANGER: Clear existing data
  // console.log('Clearing existing data...');
  // await prisma.score.deleteMany();
  // await prisma.event.deleteMany();
  // await prisma.participant.deleteMany();
  // await prisma.season.deleteMany();

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
        date, // Add the date property here
      },
      update: {
        label,
        date, // Also update the date in case the event already exists
      }
    })
  })
  await Promise.all(eventUpserts)

  async function generatePlayersAndScores() {
    function generateAgaId() {
      let agaId;
      do {
        agaId = Math.floor(10000 + Math.random() * 90000).toString();
      } while (existingAgaIds.has(agaId));
      existingAgaIds.add(agaId);
      return agaId;
    }

    // Helper to get random score based on rank
    function getRandomScore(rankInt: number) {
      // For dan ranks (0 and above), higher numbers = higher rank
      // For kyu ranks (negative), closer to 0 = higher rank
      let baseScore;
      if (rankInt >= 0) {
        // Dan ranks: 1d=0, 2d=1, 3d=2, etc.
        baseScore = 40 + (rankInt * 2);
      } else {
        // Kyu ranks: -1 = 1k (highest kyu), -30 = 30k (lowest)
        baseScore = Math.max(5, 40 + rankInt);
      }
      const variance = Math.floor(Math.random() * 10) - 5;
      return Math.max(0, baseScore + variance);
    }

    // Helper to randomly skip some events (80% participation rate)
    function shouldParticipate() {
      return Math.random() < 0.8;
    }

    // Fetch created events for score creation
    const createdEvents = await prisma.event.findMany({
      where: { seasonId: season.id }
    });

    // Create Participants
    console.log('Creating participants...');

    const firstNames = [
      'Alex', 'Sarah', 'Michael', 'Elena', 'David', 'Lisa', 'James', 'Maya',
      'Robert', 'Anna', 'Kevin', 'Sophie', 'Daniel', 'Rachel', 'Tom', 'Emma',
      'Lucas', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Isabella', 'Mason', 'Sophia',
      'Liam', 'Charlotte', 'Benjamin', 'Amelia', 'Henry', 'Mia', 'Jackson', 'Harper',
      'Aiden', 'Lily', 'Jack', 'Grace', 'Ryan', 'Chloe', 'Dylan', 'Zoe'
    ];

    const lastNames = [
      'Chen', 'Kim', 'Zhang', 'Rodriguez', 'Park', 'Wong', 'Lee', 'Patel',
      'Schmidt', 'Tran', 'Martin', 'Green', 'Anderson', 'Clark', 'Lewis', 'Wilson',
      'Brown', 'Taylor', 'Davis', 'Martinez', 'Garcia', 'Lopez', 'Johnson', 'White'
    ];

    // Helper to get random count between min and max
    function getRandomCount(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate participants across all divisions
    const participantsToCreate = [];

    // Adult divisions
    const adultDivisions = [
      { min: -30, max: -10 },
      { min: -9, max: -1 },
      { min: 0, max: 2 },    // 1d=0, 2d=1, 3d=2
      { min: 3, max: 8 }     // 4d=3, 5d=4, ... 9d=8
    ];

    for (const division of adultDivisions) {
      const ranksInDivision = [];
      for (let rank = division.min; rank <= division.max; rank++) {
        ranksInDivision.push(rank);
      }

      const count = getRandomCount(6, 10);
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rankInt = ranksInDivision[i % ranksInDivision.length];

        participantsToCreate.push({
          name: `${firstName} ${lastName}`,
          rankInt,
          agaId: generateAgaId(),
          isYouth: false
        });
      }
    }

    // Youth divisions
    const youthDivisions = [
      { min: -30, max: -18 },
      { min: -17, max: -10 },
      { min: -9, max: -1 },
      { min: 0, max: 8 }     // 1d+ (1d=0, 2d=1, etc.)
    ];

    for (const division of youthDivisions) {
      const ranksInDivision = [];
      for (let rank = division.min; rank <= division.max; rank++) {
        ranksInDivision.push(rank);
      }

      const count = getRandomCount(6, 10);
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rankInt = ranksInDivision[i % ranksInDivision.length];

        participantsToCreate.push({
          name: `${firstName} ${lastName}`,
          rankInt,
          agaId: generateAgaId(),
          isYouth: true,
        });
      }
    }

    // Bulk insert participants
    await prisma.participant.createMany({
      data: participantsToCreate
    });

    // Fetch created participants for score creation
    const participants = await prisma.participant.findMany();

    // Create Scores
    console.log('Creating scores...');
    const scoresToCreate = [];

    for (const participant of participants) {
      for (const event of createdEvents) {
        // 80% participation rate
        if (shouldParticipate()) {
          scoresToCreate.push({
            value: getRandomScore(participant.rankInt),
            agaId: participant.agaId,
            eventId: event.id
          });
        }
      }
    }

    // Bulk insert scores
    await prisma.score.createMany({
      data: scoresToCreate
    });

    console.log(`   - Created ${participants.length} participants`);
    console.log(`   - Created ${scoresToCreate.length} scores`);
  }

  // Uncomment to generate players and scores
  // await generatePlayersAndScores();

  console.log('✅ Seed complete!');
  console.log(`   - Created 1 season`);
  console.log(`   - Created ${eventLabels.length} events`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
