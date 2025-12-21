"use client";

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy, ChevronDown, ChevronRight, Medal, Award } from "lucide-react";
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

type Event = {
  id: string;
  label: string;
  resultsAvailable?: boolean;
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
  events: Event[];
  data: DivisionGroup[];
}

const getTrend = (p: Participant, events: Event[]) => {
  if (events.length < 2) return "neutral";

  const latestEventId = events[events.length - 1].id;
  const prevEventId = events[events.length - 2].id;

  const latestScore = p.scores[latestEventId] ?? 0;
  const prevScore = p.scores[prevEventId] ?? 0;

  if (latestScore > prevScore) return "up";
  if (latestScore < prevScore) return "down";
  return "neutral";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="size-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-4 text-gray-400" />;
  if (rank === 3) return <Medal className="size-4 text-amber-700" />;
  if (rank === 4) return <Award className="size-4 text-amber-700" />;
  return <span className="text-gray-500 font-semibold">{rank}</span>;
};


export default function GoLeaderboard({ events, data }: LeaderboardProps) {
  const year = new Date().getFullYear();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleDivision = (division: string) => {
    setCollapsed((prev) => ({ ...prev, [division]: !prev[division] }));
  };

  const getParticipantTotal = (p: Participant) =>
    Object.values(p.scores)
      .filter((score): score is number => score !== undefined)
      .reduce((acc, score) => acc + score, 0);

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
                  <Button
                    size="sm" variant="outline" className="text-center uppercase text-xs tracking-tighter hover:cursor-pointer"
                    onClick={() => router.push(`/results/${year}/${event.label}`)}
                    disabled={!event.resultsAvailable}
                  >
                    {event.label}
                  </Button>
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
                    const trend = getTrend(player, events);
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