import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ contents }: { contents: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {contents}
    </ReactMarkdown>
  )
}
