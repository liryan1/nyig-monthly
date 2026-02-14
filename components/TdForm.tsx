"use client";

import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMounted } from "@/lib/rtk/hooks";
import { useGenerateStandingsMutation, useGetEventsQuery, useWriteStandingsMutation } from "@/lib/rtk/tdSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Check, Info, LoaderCircle, Pen, Rocket, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const standingsFormSchema = z.object({
  eventId: z.string().optional(),
  youthUrl: z.string().min(1, "Youth tournament ID or URL is required."),
  adultUrl: z.string().min(1, "Adult tournament ID or URL is required."),
});
export type StandingsForm = z.infer<typeof standingsFormSchema>;

const currentYear = new Date().getFullYear();
const iStandingsForm: StandingsForm = {
  eventId: "",
  youthUrl: "",
  adultUrl: "",
};

export function TdForm() {
  const router = useRouter();
  const [standingsMd, setStandingsMd] = useState({ youth: "", adult: "" });
  const [isEditing, setIsEditing] = useState({ youth: false, adult: false });
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const { data: events, isLoading: eventsLoading } = useGetEventsQuery();
  const [generateStandings, { data: standingsData, isLoading: isGenerating, error: generateError }] = useGenerateStandingsMutation();
  const [writeStandings, { isLoading: isPublishing, isSuccess: isPublishSuccess, error: publishError }] = useWriteStandingsMutation();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isValid },
  } = useForm<StandingsForm>({
    resolver: zodResolver(standingsFormSchema),
    defaultValues: iStandingsForm,
    mode: "onChange",
  });

  const isMounted = useIsMounted();
  if (!isMounted) {
    return;
  }

  const onStandingsChange = (t: 'youth' | 'adult') => (content: string) => setStandingsMd({ ...standingsMd, [t]: content })
  const toggleEdit = (t: 'youth' | 'adult') => () => setIsEditing(prev => ({ ...prev, [t]: !prev[t] }));

  const handleGenerate = async (data: StandingsForm) => {
    const standings = await generateStandings(data).unwrap();
    setStandingsMd(standings)
    toast.success("Successfully generated standings")
  };

  const handlePublish = async () => {
    if (standingsData) {
      await writeStandings({
        eventId: getValues("eventId"),
        ...standingsMd,
      }).unwrap();
      toast.success("Successfully published standings and scores")
      setIsConfirmingPublish(false);
      router.push("/")
    } else {
      toast.info("No standings data to publish")
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="year">Year</Label>
            <Select disabled value={currentYear.toString()}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={currentYear} value={currentYear.toString()}>
                  {currentYear}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="event">Event</Label>
            <Controller
              control={control}
              name="eventId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="min-w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="max-w-72">
            <Label htmlFor="youth-url">Youth Tournament ID or URL</Label>
            <Input id="youth-url" {...register("youthUrl")} placeholder="fvrxvdrdrv" />
            {errors.youthUrl && <p className="text-destructive text-sm">{errors.youthUrl.message}</p>}
          </div>
          <div className="max-w-72">
            <Label htmlFor="adult-url">Adult Tournament ID or URL</Label>
            <Input id="adult-url" {...register("adultUrl")} placeholder="jpkusnrdoa" />
            {errors.adultUrl && <p className="text-destructive text-sm">{errors.adultUrl.message}</p>}
          </div>

        </div>
        <div className="flex justify-between">
          <Button type="submit" disabled={isGenerating || !isValid || eventsLoading}>
            {isGenerating ? "Calculating..." : (standingsData ? "Re-calculate standings" : "Calculate standings")}
            {isGenerating ? <LoaderCircle className="animate-spin" /> : <Calculator />}
          </Button>
          <Dialog open={isConfirmingPublish} onOpenChange={setIsConfirmingPublish}>
            <DialogTrigger asChild>
              <Button type="button" disabled={!standingsData || isPublishing || isPublishSuccess || eventsLoading}>
                {isPublishing ? "Publishing..." : "Publish results"}
                {isPublishing ? <LoaderCircle className="animate-spin" /> : <Rocket />}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="space-y-2">
                <DialogTitle>Confirm Publish</DialogTitle>
                <DialogDescription className="text-sm">
                  Clicking submit will update the live standings and scores for the selected event. Verify each standings group have the correct placements and scores.
                </DialogDescription>
                <DialogDescription className="flex items-center gap-1 text-sm text-destructive">
                  <Info className="size-4" />
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmingPublish(false)}>
                  Cancel
                  <X />
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? "Publishing..." : "Publish"}
                  {isPublishing ? <LoaderCircle className="animate-spin" /> : <Check />}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
      {generateError && <div className="text-destructive">Error generating standings: {JSON.stringify(generateError)}</div>}
      {publishError && <div className="text-destructive">Error publishing standings: {JSON.stringify(publishError)}</div>}

      {standingsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div>
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-2xl font-semibold">Youth Standings</h2>
              <Button variant="outline" size="sm" onClick={toggleEdit('youth')}>
                {isEditing.youth ? 'Save' : 'Edit'}
                {isEditing.youth ? <Save className="ml-2 h-4 w-4" /> : <Pen className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            <div className="h-[50vh] overflow-y-auto">
              {isEditing.youth ? (
                <MarkdownEditor
                  value={standingsMd.youth}
                  onChange={onStandingsChange('youth')}
                />
              ) : (
                <div className="p-4 border rounded-md prose dark:prose-invert max-w-none">
                  <MarkdownRenderer contents={standingsMd.youth} />
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-2xl font-semibold">Adult Standings</h2>
              <Button variant="outline" size="sm" onClick={toggleEdit('adult')}>
                {isEditing.adult ? 'Save' : 'Edit'}
                {isEditing.adult ? <Save className="ml-2 h-4 w-4" /> : <Pen className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            <div className="h-[50vh] overflow-y-auto">
              {isEditing.adult ? (
                <MarkdownEditor
                  value={standingsMd.adult}
                  onChange={onStandingsChange('adult')}
                />
              ) : (
                <div className="p-4 border rounded-md prose dark:prose-invert max-w-none">
                  <MarkdownRenderer contents={standingsMd.adult} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
