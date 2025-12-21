# NYIG Monthly

Leaderboard for the New York Institute of Go Monthly Tournaments.

## Scripts

Prod database is being modified if changing `.env`.

`scripts/seed.py` - Script to seed initial data. Change `year` to create Season and Events.

`scripts/td/main.ts`

1. Copy and paste network tab standings in Leaggo into `results_youth.ts` and `results_adult.ts`
2. Run `npx tsx scripts/td/main.ts` to upload rank and upload results to results/{year}/{label}. Calculates and uploads scores to the database.
