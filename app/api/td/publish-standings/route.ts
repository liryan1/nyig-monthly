import { prisma } from "@/lib/prisma";
import { getRankInt } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { eventId, youth, adult } = await req.json();
    const content = `## Youth Standings\n\n${youth}\n## Adult Standings\n\n${adult}`;
    const updateEvent = prisma.event.update({
      where: { id: eventId },
      data: { results: content },
    })

    const youths = parsePlayerData(youth)
    const adults = parsePlayerData(adult)

    const youth_updates = youths.map(y => upsertPlayerAndScore({ pd: y, eventId, isYouth: true }))
    const adult_updates = adults.map(y => upsertPlayerAndScore({ pd: y, eventId }))

    await Promise.all([updateEvent, ...youth_updates, ...adult_updates])

    return NextResponse.json({ message: "successfully published results" })

  } catch (error) {
    console.error('Error reading results.md:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

interface PlayerData {
  agaId: string;
  name: string;
  rank: string;
  score: number;
}

export function parsePlayerData(markdown: string): PlayerData[] {
  // Matches: | pos | AGA_ID | NAME RANK | ... | **SCORE** |
  const rowRegex = /\|\s*\d+\s*\|\s*(\d+)\s*\|\s*(.*?)\s+(\d+[kd])\s*\|.*?\*\*(\d+)\*\*\s*\|/g;

  return Array.from(markdown.matchAll(rowRegex), match => ({
    agaId: match[1],
    name: match[2].trim(), // Trim ensures no trailing spaces are left
    rank: match[3],
    score: parseInt(match[4], 10)
  }));
}

async function upsertPlayerAndScore({ pd, eventId, isYouth }: { pd: PlayerData, eventId: string, isYouth?: boolean }) {
  const rankInt = getRankInt(pd.rank)
  if (rankInt === null) {
    throw Error("Invalid rank")
  }

  // Upsert Participant
  const participant = await prisma.participant.upsert({
    where: { agaId: pd.agaId },
    update: {
      rankInt,
    },
    create: {
      agaId: pd.agaId,
      name: pd.name,
      rankInt,
      isYouth: !!isYouth,
    }
  });

  // Create or Update Score
  await prisma.score.upsert({
    where: {
      agaId_eventId: {
        agaId: participant.agaId,
        eventId,
      }
    },
    update: { value: pd.score },
    create: {
      value: pd.score,
      agaId: participant.agaId,
      eventId,
    }
  });
}
