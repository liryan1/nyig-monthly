import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getFetchUrl } from "@/lib/utils";
import { notFound } from "next/navigation";

const CACHE_INTERVAL = parseInt(process.env.CACHE_INTERVAL_SECONDS ?? "3600");

type Params = {
  params: Promise<{
    year: string;
    label: string;
  }>;
};

async function getResults(year: string, label: string) {
  const url = getFetchUrl(`results/${year}/${label}`);
  const res = await fetch(url.toString(), {
    next: { revalidate: CACHE_INTERVAL }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch results");

  return res.json();
}

export default async function ResultsPage({ params }: Params) {
  const { year, label } = await params;
  const data = await getResults(year, label);

  if (!data?.results) {
    notFound();
  }

  return (
    <div className="prose max-w-4xl mx-auto p-6">
      <h1 className="font-semibold">Monthly Series {year} - {label.toUpperCase()} Standings</h1>
      <MarkdownRenderer contents={data.results} />
    </div>
  );
}