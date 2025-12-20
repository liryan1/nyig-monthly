import CategoryTabs from "@/components/CategoryTabs";
import CollapsibleLeaderboard from "@/components/Leaderboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";

const CACHE_INTERVAL = 1;

const getFetchUrl = (circuit: string) => {
  const currentYear = process.env.YEAR;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not defined");
  if (!currentYear) throw new Error("YEAR is not defined");

  const url = new URL("/api/leaderboard", baseUrl);
  url.searchParams.set("circuit", circuit);
  url.searchParams.set("year", currentYear);
  return url.toString();
}

async function LeaderboardData({ circuit }: { circuit: string }) {
  try {
    const res = await fetch(getFetchUrl(circuit), {
      next: { revalidate: CACHE_INTERVAL },
    });

    if (!res.ok) throw new Error("Failed to fetch leaderboard data");

    const { events, data } = await res.json();
    return <CollapsibleLeaderboard events={events} data={data} />;
  } catch (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>We couldn&apos;t load the leaderboard data for this circuit. Refresh the page to try again.</p>
        </AlertDescription>
        {!!error && <AlertDescription className="flex flex-col gap-4">
          {JSON.stringify(error)}
        </AlertDescription>}
      </Alert>
    );
  }
}

export default async function LeaderboardPage({ circuit }: { circuit: string }) {
  return (
    <div className="container mx-auto space-y-4">
      <CategoryTabs />

      <Suspense key={circuit} fallback={<LeaderboardSkeleton />}>
        <LeaderboardData circuit={circuit} />
      </Suspense>
    </div>
  );
}
