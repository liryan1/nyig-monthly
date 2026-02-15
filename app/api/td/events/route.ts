import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentYear = 2025 // new Date().getFullYear();

    const season = await prisma.season.findUnique({ where: { year: currentYear }, select: { id: true } });
    if (!season) throw Error("Failed to read season")
    const events = await prisma.event.findMany({
      where: {
        seasonId: season.id,
      },
      select: { id: true, label: true, results: true },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(events.filter(e => !e.results).map(e => ({ id: e.id, label: e.label })));
  } catch (error) {
    console.error('Error reading results.md:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}