"use client";

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy, ChevronDown, ChevronRight, Medal, Award } from "lucide-react";
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Event = {
  id: string;
  label: string;
  date: string;
  resultsAvailable?: boolean;
  isLatest?: boolean;
};

type Participant = {
  id: string;
  name: string;
  rank: string;
  scores: Partial<Record<string, number>>; // key is event.id
};

type DivisionGroup = {
  division: string;
  participants: Participant[];
};

interface LeaderboardProps {
  year?: string;
  events: Event[];
  data: DivisionGroup[];
}

/**
 * Calculates the participant total based on their top 5 performing scores
 */
const getParticipantTotal = (p: Participant) =>
  Object.values(p.scores)
    .filter((score): score is number => score !== undefined)
    .sort((a, b) => b - a)
    .slice(0, 5)
    .reduce((acc, score) => acc + score, 0);

// This is always safe
const getTrend = (
  currentParticipant: Participant,
  allParticipantsInDivision: Participant[],
  events: Event[]
) => {
  try {
    const latestEventIndex = events.findIndex((e) => e.isLatest);
    if (latestEventIndex <= 0) return "neutral"; // Need at least two events to compare trend

    const eventsUpToPrevious = events.slice(0, latestEventIndex); // Excludes the latest event

    // Calculate total score considering only events up to a certain point
    const calculateTotalForEventSubset = (p: Participant, eventSubset: Event[]) => {
      // Filter p.scores to only include scores from the eventSubset
      const relevantScores = Object.entries(p.scores)
        .filter(([eventId]) => eventSubset.some(e => e.id === eventId))
        .map(([, score]) => score);

      // Apply the top 5 logic from getParticipantTotal
      return relevantScores
        .filter((score): score is number => score !== undefined)
        .sort((a, b) => b - a)
        .slice(0, 5)
        .reduce((acc, score) => acc + score, 0);
    };

    // Determine current rank (since allParticipantsInDivision is already sorted by current standings)
    const currentRank = allParticipantsInDivision.findIndex(p => p.id === currentParticipant.id);

    // Calculate previous standings by re-sorting based on scores up to the previous event
    const previousStandingsSorted = [...allParticipantsInDivision].sort((a, b) => {
      const totalA = calculateTotalForEventSubset(a, eventsUpToPrevious);
      const totalB = calculateTotalForEventSubset(b, eventsUpToPrevious);
      return totalB - totalA;
    });

    const previousRank = previousStandingsSorted.findIndex(p => p.id === currentParticipant.id);

    // Handle new participants (who were not ranked previously)
    if (previousRank === -1 && currentRank !== -1) return "up";
    // If the participant isn't in current standings (shouldn't happen with current logic), or if both are -1
    if (currentRank === -1 || previousRank === -1) return "neutral"; // Simplified: if either is missing, no clear trend

    // Compare ranks (lower index means better rank)
    if (currentRank < previousRank) return "up";
    if (currentRank > previousRank) return "down";
    
    return "neutral";
  } catch (error) {
    console.error("Error calculating trend:", error);
    return "neutral";
  }
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="size-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-4 text-gray-400" />;
  if (rank === 3) return <Medal className="size-4 text-amber-700" />;
  if (rank === 4) return <Award className="size-4 text-amber-700" />;
  return <span className="text-gray-500 font-semibold">{rank}</span>;
};

export const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC", // Prevents shift to local user time
    }).format(new Date(dateString));
  } catch (error) {
    console.log("Failed to parse date string:", error);
    return ""
  }
};


export default function GoLeaderboard({ events, data, year }: LeaderboardProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleDivision = (division: string) => {
    setCollapsed((prev) => ({ ...prev, [division]: !prev[division] }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto">

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="min-w-[180px]">Participant</TableHead>
              {events.map((event) => (
                <TableHead key={event.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-block">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!event.resultsAvailable}
                            className={cn(
                              event.isLatest ? "font-bold text-blue-600 underline" : "",
                              "text-center uppercase text-xs tracking-tighter hover:cursor-pointer",
                              // Ensure button doesn't block events meant for the wrapper
                              !event.resultsAvailable && "pointer-events-none opacity-50"
                            )}
                            onClick={() => router.push(`/results/${year}/${event.label}`)}
                          >
                            {event.label}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatDate(event.date)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
              <TableHead className="text-right pr-6 font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((group) => {
              const isCollapsed = collapsed[group.division];
              const sortedParticipants = [...group.participants].sort(
                (a, b) => getParticipantTotal(b) - getParticipantTotal(a)
              );

              return (
                <React.Fragment key={group.division}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/30 border-b-0 group/header select-none"
                    onClick={() => toggleDivision(group.division)}
                  >
                    <TableCell colSpan={events.length + 3}>
                      <div className="flex justify-between items-center">
                        <div className='flex items-center gap-2'>
                          <div className="flex items-center justify-center">
                            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                          </div>
                          <span className="font-bold text-xs uppercase">
                            {group.division}
                          </span>
                        </div>

                        <span className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                          {group.participants.length} Players
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {!isCollapsed && sortedParticipants.map((player, idx) => {
                    const trend = getTrend(player, sortedParticipants, events);
                    const rank = idx + 1;
                    const rankIcon = getRankIcon(rank);


                    return <TableRow key={player.id} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                      <TableCell className="text-center">
                        <div className="flex justify-center text-xs font-medium">
                          {rankIcon}
                        </div>
                      </TableCell>
                      <TableCell className='flex gap-2 items-center'>
                        <span className="font-semibold text-sm tracking-tight">{player.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{player.id}</span>
                        <Badge variant="outline" className="h-4 select-none">{player.rank}</Badge>
                      </TableCell>
                      {events.map((event) => {
                        const score = player.scores[event.id];
                        return (
                          <TableCell key={event.id} className="text-center tabular-nums text-sm">
                            {score !== undefined ? (
                              <span className="text-foreground">{score}</span>
                            ) : (
                              <Minus className="w-3 h-3 mx-auto opacity-20" />
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-bold text-sm tabular-nums">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-primary">
                            {getParticipantTotal(player)}
                          </span>
                          {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                          {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                          {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}