import * as fs from 'fs';
import { youth, adult } from "./divisions";
import { getStandingsMarkdown, getUnifiedStandings } from "./getStandings";
import { results_youth } from "./results_youth";
import { results_adult } from "./results_adult";
import { syncStandingsToDb } from './syncStandingsToDb';
import { UnifiedPlayerResult } from './models';
import { syncResultsToDb } from './syncResultsToDb';

const youth_standings = getUnifiedStandings(youth, results_youth)
const youth_markdown = getStandingsMarkdown(youth_standings)

const adult_standings = getUnifiedStandings(adult, results_adult)
const adult_markdown = getStandingsMarkdown(adult_standings)
const content = `## Youth Standings\n\n${youth_markdown}\n## Adult Standings\n\n${adult_markdown}`

const filePath = 'results.md';
function writeResults({ eventLabel, year, results }: { eventLabel: string, year: number, results: string }) {
  try {
    syncResultsToDb({ eventLabel, year, results })
    fs.writeFileSync('results.md', content, 'utf-8');
    console.log(`Text written to ${filePath} successfully.`);
  } catch (err) {
    console.error(err);
  }
}

async function writeScoresSync({ results, eventLabel, year, isProd, isYouth }: { results: UnifiedPlayerResult[], eventLabel: string, year: number, isProd?: boolean, isYouth: boolean }) {
  try {
    console.log(`Processing ${results.length} player results.`);

    console.log(isProd ? "--- Starting Production Sync ---" : "--- Starting Dry Run ---");
    await syncStandingsToDb(results, {
      eventLabel,
      year,
      isDryRun: !isProd,
      isYouth,
    });

  } catch (error) {
    console.error("Failed to sync tournament standings:", error);
  }
}

const eventLabel = "feb";
const year = 2026;
const isProd = true

// Write standings to DB and to a results markdown file
// overwrites the file in 
writeResults({ eventLabel, year, results: content });

const youth_results = Object.values(youth_standings).flat();
writeScoresSync({ results: youth_results, isProd, isYouth: true, eventLabel, year });

const adult_results = Object.values(adult_standings).flat();
writeScoresSync({ results: adult_results, isProd, isYouth: false, eventLabel, year });
