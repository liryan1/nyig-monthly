import { PlayerData } from "./models";

/**
 * Checks if playerA defeated playerB in their direct match.
 */
function defeatedHeadToHead(playerA: PlayerData, playerB: PlayerData): number {
  const opponentIndex = playerB.rowIndex.toString();

  const matchResult = playerA.roundScores.find(score =>
    score.startsWith(opponentIndex)
  );

  if (!matchResult) return 0; // No match played
  return matchResult.endsWith('+') ? 1 : -1;
}

/**
 * Sort logic for players in the same division:
 * Wins > SOS > SOSOS > Head-to-Head
 */
export function playerSortLogic(a: PlayerData, b: PlayerData) {
  // 1. Primary: Wins
  if (b.wins !== a.wins) return b.wins - a.wins;

  // 2. Tie-break 1: SOS
  if (b.sumOfOpponentScores !== a.sumOfOpponentScores) {
    return b.sumOfOpponentScores - a.sumOfOpponentScores;
  }

  // 3. Tie-break 2: SOSOS
  if (b.sumOfSumOfOpponentScores !== a.sumOfSumOfOpponentScores) {
    return b.sumOfSumOfOpponentScores - a.sumOfSumOfOpponentScores;
  }

  // 4. Tie-break 3: Head-to-Head
  const h2h = defeatedHeadToHead(a, b);
  if (h2h !== 0) {
    return h2h === 1 ? -1 : 1; // If a won, a comes first (negative return)
  }

  console.warn("WARNING: Absolute tie during playerSortLogic")
  return 0; // Absolute tie
}
