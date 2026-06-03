"use dom";

import "../styles/_keyframe-animations.scss";
import "../styles/_variables.scss";

import { SimpleEditor } from "@/components/tiptap/tiptap-templates/simple/simple-editor";
import { EditorMentionItem } from "./tiptap/tiptap-templates/simple/mention-suggestion";

/**
 * TiptapWrapper is a DOM component that runs Tiptap in a webview environment.
 * It triggers onReady when the editor is fully initialized.
 */
export default function TiptapWrapper({
  initialContent,
  onContentChange,
  onReady,
  memberList,
  cardList,
}: {
  initialContent: string;
  onContentChange?: (html: string, mentionedMemberIds: string[]) => void;
  onReady?: () => void;
  memberList?: EditorMentionItem[];
  cardList?: EditorMentionItem[];

  dom?: import("expo/dom").DOMProps;
}) {
  return (
    <div
      style={{
        flex: 1,
        // display: "flex",
        // flexDirection: "column",
        // backgroundColor: "white",
        // minHeight: "100%",
      }}
    >
      <SimpleEditor
        initialContent={initialContent}
        onUpdate={(content, mentionedMemberIds) => {
          if (onContentChange) {
            onContentChange(content, mentionedMemberIds);
          }
        }}
        onReady={() => {
          if (onReady) {
            onReady();
          }
        }}
        memberList={memberList}
        cardList={cardList}
      />
    </div>
  );
}
