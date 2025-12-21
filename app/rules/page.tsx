import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getMarkdownData } from "@/lib/read_markdown";

export default async function RulesPage() {
  const contents = getMarkdownData("rules")
  return (
    <div className="prose max-w-4xl mx-auto p-6">
      <MarkdownRenderer contents={contents} />
    </div>
  );
}
