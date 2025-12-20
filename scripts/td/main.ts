import * as fs from 'fs';
import { youth, adult } from "./divisions";
import { getStandingsMarkdown, getUnifiedStandings } from "./getStandings";
import { results_youth } from "./results_youth";
import { results_adult } from "./results_adult";
import { syncStandingsToDb } from './syncStandingsToDb';
import { UnifiedPlayerResult } from './models';

const youth_standings = getUnifiedStandings(youth, results_youth)
const youth_markdown = getStandingsMarkdown(youth_standings)

const adult_standings = getUnifiedStandings(adult, results_adult)
const adult_markdown = getStandingsMarkdown(adult_standings)

function writeResultsFile() {
  const content = `## Youth Standings

  ${youth_markdown}
  ## Adult Standings

  ${adult_markdown}
  `

  const filePath = 'results.md';

  try {
    fs.writeFileSync('results.md', content, 'utf-8');
    console.log(`Text written to ${filePath} successfully.`);
  } catch (err) {
    console.error(err);
  }
}


async function writeScoresSync({ results, isProd, isYouth }: { results: UnifiedPlayerResult[], isProd?: boolean, isYouth: boolean }) {
  try {
    console.log(`Processing ${results.length} player results.`);

    console.log(isProd ? "--- Starting Production Sync ---" : "--- Starting Dry Run ---");
    await syncStandingsToDb(results, {
      eventLabel: "Oct",
      year: 2025,
      isDryRun: !isProd,
      isYouth,
    });

  } catch (error) {
    console.error("Failed to sync tournament standings:", error);
  }
}

// Write standings to a results markdown file
// overwrites the file in 
// writeResultsFile();

const youth_results = Object.values(youth_standings).flat();
writeScoresSync({ results: youth_results, isProd: false, isYouth: true });

const adult_results = Object.values(adult_standings).flat();
writeScoresSync({ results: adult_results, isProd: false, isYouth: false });
