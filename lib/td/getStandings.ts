import { getRankDisplay } from "@/lib/utils";
import { Division, PLACEMENT_POINTS, PlayerData, UnifiedPlayerResult } from "./models";
import { playerSortLogic } from "./sortPlayers";

// Helper function to convert AGA rank ID to the internal rank integer (kyu are negative, dan are positive)
function convertAgaRankToRankInt(agaRankId: number): number {
  // Assuming the pattern agaRankId - 30 gives the correct rankInt
  // For example: 34 (5d) -> 4; 30 (1d) -> 0; 29 (1k) -> -1; 17 (13k) -> -13
  return agaRankId - 30;
}

/**
 * Organizes players into divisions with full tie-breaking logic in `sortPlayers`
 */
/**
 * Processes all divisions and returns a flat list of players with 
 * combined performance and placement data.
 */
export function getUnifiedStandings(
  divisions: Division[],
  players: PlayerData[]
): Record<string, UnifiedPlayerResult[]> {
  const allResults: UnifiedPlayerResult[] = [];

  divisions.forEach((division) => {
    // 1. Group and Sort
    const playersInDivision = players
      .filter((p) => {
        const playerRankInt = convertAgaRankToRankInt(p.rankId); // Use rankId and the new converter
        return playerRankInt >= division.min && playerRankInt <= division.max;
      })
      .sort(playerSortLogic);

    // 2. Map to unified format

    // tracks offset for players that did not receive points due to skipped rounds
    // the points are still allocated to the next player down
    let offset = 0
    playersInDivision.forEach((player, index) => {
      const position = index + 1;
      let points = PLACEMENT_POINTS[position + offset] ?? 1;
      // If the player skipped any round, they are not eligible for points
      if (!player.roundScores.every(score => score !== "skip")) {
        points = 0;
        offset--;
      }

      allResults.push({
        position,
        fullName: `${player.givenName} ${player.familyName}`,
        wins: player.wins,
        rankInt: convertAgaRankToRankInt(player.rankId), // Use rankId and the new converter
        sos: player.sumOfOpponentScores,
        sosos: player.sumOfSumOfOpponentScores,
        score: points,
        agaId: player.memberId,
        divisionLabel: division.label
      });
    });
  });

  const grouped = allResults.reduce((acc, player) => {
    if (!acc[player.divisionLabel]) acc[player.divisionLabel] = [];
    acc[player.divisionLabel].push(player);
    return acc;
  }, {} as Record<string, UnifiedPlayerResult[]>);

  return grouped;
}

export function getStandingsMarkdown(results: Record<string, UnifiedPlayerResult[]>) {
  let markdown = "";

  Object.entries(results).forEach(([division, players]) => {
    markdown += `### Division: ${division}\n\n`;
    markdown += `| Pos | AGA ID | Name | Wins | SOS | SOSOS | Points |\n`;
    markdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    players.forEach((p) => {
      markdown += `| ${p.position} | ${p.agaId} | ${p.fullName} ${getRankDisplay(p.rankInt)} | ${p.wins} | ${p.sos} | ${p.sosos} | **${p.score}** |\n`;
    });

    markdown += "\n";
  });

  return markdown;
}

// const standings = getUnifiedStandings(youth, youthStandings)
// const markdownStandings = getStandingsMarkdown(standings)
// console.log(markdownStandings)
