import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getMarkdown } from "@/lib/get_markdown";

export default async function RulesPage() {
  const contents = getMarkdown("rules2026")
  return (
    <div className="prose max-w-4xl mx-auto p-6">
      <MarkdownRenderer contents={contents} />
    </div>
  );
}
