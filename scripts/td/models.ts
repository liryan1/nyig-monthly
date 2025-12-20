
export interface Division {
  label: string;
  min: number;
  max: number;
}

export interface PlayerData {
  rowIndex: number;
  memberId: string;
  givenName: string;
  familyName: string;
  rating: number;
  wins: number;
  sumOfOpponentScores: number;
  sumOfSumOfOpponentScores: number;
  roundScores: string[]; // e.g., ["5+", "3+", "2+", "4-"]
}

export interface StandingResult {
  memberId: string;
  score: number;
  name: string;
}

export interface UnifiedPlayerResult {
  position: number;
  fullName: string;
  rankInt: number;
  wins: number;
  sos: number;
  sosos: number;
  score: number;
  agaId: string;
  divisionLabel: string;
}

export const PLACEMENT_POINTS: Record<number, number> = {
  1: 12,
  2: 9,
  3: 7,
  4: 6,
  5: 5,
  6: 4,
  7: 3,
  8: 2,
};
