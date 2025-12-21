import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string; label: string }> }
) {
  try {
    const { year, label } = await params;
    const yearInt = parseInt(year, 10);

    if (isNaN(yearInt)) {
      return NextResponse.json({ error: "Invalid year format" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: {
        label: label,
        season: {
          year: yearInt,
        },
      },
      select: {
        results: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: `No results found for ${label} in ${year}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ results: event.results, });
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
