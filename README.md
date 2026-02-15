# NYIG Monthly

Leaderboard for the New York Institute of Go Monthly Tournaments.

## Tournament Director

TDs should go to the `/td` page to submit results. Logic is based on leago.gg format and calls leago APIs to fetch tournament results.

## Scripts

Prod database is being modified if changing `.env`. WARNING: After making manual fixes in prod, CHANGE BACK `.env`.

### Revert Publish

Removes the published event.results and removes all scores associated with the event. This essentially undos the `/td` publish workflow.

```sh
npm run script:revert-publish mar 2026
```
