import { cn } from "@/lib/utils";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertTable,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

interface Props {
  value?: string;
  onChange?: (markdown: string) => void;
}

export function MarkdownEditor({ value = "", onChange }: Props) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card overflow-hidden",
        // Toolbar look (mdxeditor renders its own toolbar wrapper)
        "[&_.mdxeditor-toolbar]:border-b",
        "[&_.mdxeditor-toolbar]:bg-muted/40",
        "[&_.mdxeditor-toolbar]:p-0",
      )}
    >
      <MDXEditor
        markdown={value}
        onChange={onChange}
        contentEditableClassName={cn(
          "max-w-none min-h-[120px] px-4 py-3 focus:outline-none",
          markdownProseClass,

          // Approximate renderer's "table wrapper" behavior:
          // make tables themselves horizontally scrollable
          "prose-table:block prose-table:overflow-x-auto prose-table:max-w-full",
        )}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          tablePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          thematicBreakPlugin(),
          diffSourcePlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => <EditorToolbar />,
          }),
        ]}
      />
    </div>
  );
}

function EditorToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <DiffSourceToggleWrapper>
        <BlockTypeSelect />
        <Separator />
        <BoldItalicUnderlineToggles />
        <Separator />
        <InsertTable />
        <CreateLink />
        <Separator />
        <ListsToggle />
        <Separator />
        <StrikeThroughSupSubToggles />
        <Separator />
        <UndoRedo />
        <Separator />
      </DiffSourceToggleWrapper>
    </div>
  );
}

export const markdownProseClass = cn(
  "prose dark:prose-invert",

  // Improve dark mode text too dim
  "dark:prose-p:text-foreground dark:prose-headings:text-foreground",
  "dark:prose-li:text-foreground dark:prose-strong:text-foreground",

  // Table mods
  "prose-table:bg-card prose-table:mt-0 prose-table:mb-0",
  "prose-table:border prose-table:border-collapse prose-table:border-border",
  "prose-th:border prose-th:border-b-2 prose-th:border-border prose-th:p-2 prose-th:bg-muted/60 prose-th:hover:bg-muted/100 prose-th:transition-colors",
  "prose-td:border prose-td:border-border prose-td:p-2 prose-td:hover:bg-muted/100 prose-td:transition-colors",
  // h2 mods
  "prose-h2:mt-6 prose-h2:sm:mt-10 prose-h2:mb-4 prose-h2:sm:mb-6",
  "prose-h2:text-[20px] prose-h2:sm:text-[22px] prose-h2:md:text-[26px] prose-h2:lg:text-[30px] prose-h2:font-semibold",
  // p mods
  "prose-p:text-xs prose-p:sm:text-base",
);
