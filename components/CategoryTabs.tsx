"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("circuit") || "youth";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("circuit", value);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      defaultValue={currentTab}
      onValueChange={handleTabChange}
    >
      <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-lg">
        <TabsTrigger
          value="youth"
          className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold uppercase tracking-wider"
        >
          Youth Circuit
        </TabsTrigger>
        <TabsTrigger
          value="adult"
          className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold uppercase tracking-wider"
        >
          Adult Circuit
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
