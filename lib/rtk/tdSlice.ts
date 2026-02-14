import { StandingsForm } from "@/components/TdForm";
import { apiSlice } from "./api";

type Standings = {
  adult: string
  youth: string
}

export const tdApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<{ id: string; label: string }[], void>({
      query: () => ({
        url: "td/events",
      })
    }),

    generateStandings: builder.mutation<Standings, StandingsForm>({
      query: (body) => ({
        url: "td/generate-standings",
        method: "POST",
        body,
      }),
    }),

    writeStandings: builder.mutation<void, Standings & Pick<StandingsForm, 'eventId'>>({
      query: (body) => ({
        url: "td/publish-standings",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGenerateStandingsMutation,
  useWriteStandingsMutation,
} = tdApi;
