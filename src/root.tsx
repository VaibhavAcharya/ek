import { ColorSelector } from "./components/editor/bubble-menu/color-selector"
import { LinkSelector } from "./components/editor/bubble-menu/link-selector"
import { NodeSelector } from "./components/editor/bubble-menu/node-selector"
import { TextButtons } from "./components/editor/bubble-menu/text-buttons"
import { defaultExtensions } from "./components/editor/extensions"
import {
  slashCommand,
  suggestionItems,
} from "./components/editor/slash-commands"
import { useIndexedDB } from "./hooks/use-indexed-db"
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
} from "novel"
import { handleCommandNavigation } from "novel/extensions"
import { useState } from "react"

export default function Root() {
  const { isFetching, error, content, setContent } = useIndexedDB("content", {
    dbName: "ek",
    storeName: "editor",
    debounceMs: 250,
    initialValue: JSON.stringify(initialContent),
  })

  const [openNode, setOpenNode] = useState(false)
  const [openLink, setOpenLink] = useState(false)
  const [openColor, setOpenColor] = useState(false)

  if (isFetching) {
    return null
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <EditorRoot>
        <EditorContent
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}
          extensions={[...defaultExtensions, slashCommand]}
          initialContent={JSON.parse(content || "null") ?? undefined}
          onUpdate={({ editor }) => {
            const jsonContent = editor.getJSON()

            setContent(JSON.stringify(jsonContent))
          }}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
          >
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <TextButtons />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}

const initialContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "ek" }],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        { type: "text", text: "this is a " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://novel.sh",
                target: "_blank",
                rel: "noopener noreferrer nofollow",
                class: null,
              },
            },
            { type: "textStyle", attrs: { color: "#9333EA" } },
          ],
          text: "novel",
        },
        { type: "text", text: " + " },
        {
          type: "text",
          marks: [{ type: "textStyle", attrs: { color: "#008A00" } }],
          text: "indexed db",
        },
        { type: "text", text: " example" },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", marks: [{ type: "code" }], text: "drink water" },
            { type: "text", text: " - " },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "a wise man",
            },
          ],
        },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "content is stored locally on indexed db",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "supports /slash & bubble menus" },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            { type: "paragraph", content: [{ type: "text", text: "AGI???" }] },
            {
              type: "orderedList",
              attrs: { start: 1 },
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Aasman" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Gaata" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "IGI" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: null },
      content: [
        {
          type: "text",
          text: "function mango(q: number = 1) {\n  return `mango lelo ${q} bhai`\n}",
        },
      ],
    },
    { type: "paragraph" },
  ],
}
