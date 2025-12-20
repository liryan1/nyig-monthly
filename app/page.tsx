import LeaderboardPage from "@/components/LeaderboardPage";
import { LogoWithText } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  searchParams?: Promise<{ circuit?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const circuit = params?.circuit || "youth";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="min-h-screen w-full max-w-6xl p-4 sm:p-16 pb-0 space-y-4 sm:space-y-12">
        <LogoWithText h={36} text="Monthly Leaderboard" />
        <LeaderboardPage circuit={circuit} />
        <div className="flex gap-4 justify-center">
          <Button>
            <Link href="https://drive.google.com/file/d/1WQZTljtosSw1R5X6td3bch18Kn8cMZUP/view" target="_blank">
              Monthly Series Rules
            </Link>
          </Button>
          <Button variant="outline">
            <Link href="https://ny-go.org/manhattan/events">
              Back to Events
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
