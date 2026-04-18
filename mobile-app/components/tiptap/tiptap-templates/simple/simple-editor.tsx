"use client";

import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

// --- Tiptap Core Extensions ---
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { Mention } from "@tiptap/extension-mention";
// import { Subscript } from "@tiptap/extension-subscript";
// import { Superscript } from "@tiptap/extension-superscript";
// import { TextAlign } from "@tiptap/extension-text-align";
// import { Typography } from "@tiptap/extension-typography";
// import { Highlight } from "@tiptap/extension-highlight";

// --- UI Primitives ---
import { Button } from "@/components/tiptap/tiptap-ui-primitive/button";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/components/tiptap/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import {
  LinkButton,
  LinkContent,
} from "@/components/tiptap/tiptap-ui/link-popover";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap/tiptap-icons/link-icon";

import { useIsBreakpoint } from "@/hooks/tiptap/use-is-breakpoint";

// --- Components ---

// --- Lib ---

// --- Styles ---
import "@/components/tiptap/tiptap-templates/simple/simple-editor.scss";
import { ListButton } from "@/components/tiptap/tiptap-ui/list-button";
import { MarkButton } from "@/components/tiptap/tiptap-ui/mark-button";
import {
  createCardMentionSuggestion,
  createMemberMentionSuggestion,
  EditorMentionItem,
} from "./mention-suggestion";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      {/* <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup> */}

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        {/*
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" /> */}
        {/* {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )} */}
        {/* {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />} */}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {/* <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} /> */}
        {/* <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        /> */}
        <ListButton type="bulletList" />
        <ListButton type="orderedList" />
        <ListButton type="taskList" />
        {/* <BlockquoteButton /> */}
        {/* <CodeBlockButton /> */}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <LinkButton onClick={onLinkClick} />
      </ToolbarGroup>

      {/* <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup> */}

      {/* <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup> */}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "link" && <LinkContent />}
  </>
);

type SimpleEditorProps = {
  initialContent?: string;

  onUpdate?: (content: string, mentionedMemberIds: string[]) => void;
  onReady?: () => void;

  memberList?: EditorMentionItem[];
  cardList?: EditorMentionItem[];
};

export function SimpleEditor({
  initialContent = "",
  onUpdate,
  onReady,

  memberList = [],
  cardList = [],
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: true,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
        blockquote: false,
        codeBlock: false,
        heading: false,
        undoRedo: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Selection,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestions: [
          createMemberMentionSuggestion(memberList),
          createCardMentionSuggestion(cardList),
        ],
      }),

      // HorizontalRule,
      // TextAlign.configure({ types: ["heading", "paragraph"] }),
      // Highlight.configure({ multicolor: true }),
      // Typography,
      // Superscript,
      // Subscript,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();

      const extractMentionIds = (node: any): string[] => {
        let ids: string[] = [];
        // If we hit a mention node, grab its ID
        if (
          node.type === "mention" &&
          node.attrs?.id &&
          node.attrs?.mentionSuggestionChar === "@"
        ) {
          ids.push(node.attrs.id);
        }
        // If this node has children, check them too
        if (node.content) {
          node.content.forEach((child: any) => {
            ids.push(...extractMentionIds(child));
          });
        }
        return ids;
      };

      const uniqueMentionIds = [...new Set(extractMentionIds(json))];

      if (onUpdate) {
        onUpdate(html, uniqueMentionIds);
      }
    },
    onCreate: () => {
      onReady?.();
    },
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef} style={{}}>
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
