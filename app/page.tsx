import LeaderboardPage from "@/components/LeaderboardPage";
import { LogoWithText } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import YearSelect from "@/components/YearSelect";
import { MoveRightIcon, ScaleIcon } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams?: Promise<{ circuit?: string, year?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const circuit = params?.circuit || "youth";
  const year = params?.year ?? new Date().getFullYear().toString();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="min-h-screen w-full max-w-6xl p-4 sm:p-16 pb-0 space-y-4 sm:space-y-12">
        <div className="flex justify-between flex-col sm:flex-row items-center gap-2">
          <LogoWithText h={36} text="Monthly Leaderboard" />
          <Button variant="outline" size="sm" asChild>
            <Link href="/rules2026">
              Rules
              <ScaleIcon />
            </Link>
          </Button>
        </div>
        <LeaderboardPage circuit={circuit} year={year} />
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/rules2026">
              Monthly Series Rules
              <ScaleIcon />
            </Link>
          </Button>
          <YearSelect />
          <Button asChild>
            <Link href="https://ny-go.org/manhattan/events">
              Back to Events
              <MoveRightIcon />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
