import { prisma } from '@/lib/prisma';
import { getStandingsMarkdown, getUnifiedStandings } from '@/lib/td/getStandings';
import { PlayerData, Rules } from '@/lib/td/models';
import { NextResponse } from 'next/server';

// 10-character alphanumeric tournament ID
const LEAGO_TOURNAMENT_ID_REGEX = /[a-zA-Z0-9]{10}/;
const LEAGO_URL_FORMAT = "https://api.leago.gg/api/v1/tournaments/TOURNAMENT_ID/standings"
const year = new Date().getFullYear();

export async function POST(req: Request) {
  try {
    const { youthUrl: youthLeagoUrl, adultUrl: adultLeagoUrl } = await req.json();

    const season = await prisma.season.findUniqueOrThrow({ where: { year } });
    const rules = season.rules as unknown as Rules;

    const [results_youth, results_adult] = await Promise.all([
      fetchResultsFromLeago(youthLeagoUrl),
      fetchResultsFromLeago(adultLeagoUrl)
    ])

    const youth_standings = getUnifiedStandings(rules["youth"], results_youth);
    const adult_standings = getUnifiedStandings(rules["adult"], results_adult);

    return NextResponse.json({
      youth: getStandingsMarkdown(youth_standings),
      adult: getStandingsMarkdown(adult_standings),
    });
  } catch (error) {
    console.error('Error reading results.md:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

function getLeagoUrl(input: string): string {
  const error = Error("Invalid tournament URL input: " + input)
  if (typeof input !== "string" || input.length > 5000) {
    throw error
  }

  const match = input.match(LEAGO_TOURNAMENT_ID_REGEX);

  if (match && match[0]) {
    return LEAGO_URL_FORMAT.replace("TOURNAMENT_ID", match[0]);
  } else {
    throw error;
  }
}

async function fetchResultsFromLeago(input: string): Promise<PlayerData[]> {
  const url = getLeagoUrl(input)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
  }
  return response.json() as Promise<PlayerData[]>;
}
