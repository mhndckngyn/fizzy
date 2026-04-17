"use client";

import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

// --- Tiptap Core Extensions ---
import { TaskItem, TaskList } from "@tiptap/extension-list";
// import { Subscript } from "@tiptap/extension-subscript";
// import { Superscript } from "@tiptap/extension-superscript";
// import { TextAlign } from "@tiptap/extension-text-align";
// import { Typography } from "@tiptap/extension-typography";
// import { Highlight } from "@tiptap/extension-highlight";
import { Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { LinkButton, LinkContent } from "@/components/tiptap-ui/link-popover";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

// --- Components ---

// --- Lib ---

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { ListButton } from "@/components/tiptap-ui/list-button";
import { MarkButton } from "@/components/tiptap-ui/mark-button";

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

export function SimpleEditor({
  initialContent = "",
  onUpdate,
  onReady,
}: {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  onReady?: () => void;
}) {
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
      // HorizontalRule,
      // TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      // Highlight.configure({ multicolor: true }),
      // Typography,
      // Superscript,
      // Subscript,
      Selection,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
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
