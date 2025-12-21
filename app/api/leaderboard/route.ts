import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Participant } from "@prisma/client";
import { getRankDisplay } from "@/lib/utils";

// Structure of the JSON rules stored in the Season model
interface DivisionRule {
  label: string;
  min: number;
  max: number;
}

interface SeasonRules {
  adult: DivisionRule[];
  youth: DivisionRule[];
}

// Define the shape of our aggregated participant data
interface AggregatedParticipant {
  id: string; // agaId
  name: string;
  rank: string;
  rankInt: number;
  scores: Record<string, number>; // key is eventId, value is score
  totalPoints: number;
}

interface DivisionGroup {
  division: string;
  participants: AggregatedParticipant[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.get("year") || currentYear.toString());
  const circuit = (searchParams.get("circuit") || "youth") as keyof SeasonRules;
  const isYouth = circuit === "youth";

  const season = await prisma.season.findUnique({
    where: { year },
    include: {
      events: {
        include: {
          scores: {
            include: { participant: true },
          },
        },
      },
    },
  });

  if (!season) {
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }

  // Cast JSON rules safely
  const rulesData = season.rules as unknown as SeasonRules;
  const rules: DivisionRule[] = rulesData[circuit] || [];

  const participantMap: Record<string, AggregatedParticipant> = {};

  season.events.forEach((event) => {
    event.scores.forEach((score) => {
      const p: Participant = score.participant;
      if (p.isYouth !== isYouth) return;

      if (!participantMap[p.id]) {
        participantMap[p.id] = {
          id: p.agaId,
          name: p.name,
          rank: getRankDisplay(p.rankInt),
          rankInt: p.rankInt,
          scores: {},
          totalPoints: 0
        };
      }

      participantMap[p.id].scores[event.id] = score.value;
      participantMap[p.id].totalPoints += score.value;
    });
  });

  const allParticipants = Object.values(participantMap);

  const data: DivisionGroup[] = rules.map((rule) => ({
    division: rule.label,
    participants: allParticipants
      .filter((p) => p.rankInt >= rule.min && p.rankInt <= rule.max)
      .sort((a, b) => b.totalPoints - a.totalPoints),
  })).filter((group) => group.participants.length > 0);

  return NextResponse.json({
    events: season.events.map((e) => ({ id: e.id, label: e.label, resultsAvailable: !!e.results })),
    data,
  });
}
