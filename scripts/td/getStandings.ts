import { getRankDisplay } from "@/lib/utils";
import { Division, PLACEMENT_POINTS, PlayerData, UnifiedPlayerResult } from "./models";
import { playerSortLogic } from "./sortPlayers";

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
      .filter((p) => p.rating >= division.min && p.rating <= division.max)
      .sort(playerSortLogic);

    // 2. Map to unified format
    playersInDivision.forEach((player, index) => {
      const position = index + 1;
      let points = PLACEMENT_POINTS[position] ?? 0;
      if (!player.roundScores.every(score => score === "skip")) {
        points = 1;
      }

      allResults.push({
        position,
        fullName: `${player.givenName} ${player.familyName}`,
        wins: player.wins,
        rankInt: player.rating > 0 ? Math.floor(player.rating) - 1 : Math.ceil(player.rating),
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
    markdown += `| Pos | agaId | Name | Wins | SOS | SOSOS | Score |\n`;
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
