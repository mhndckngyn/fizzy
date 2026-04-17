"use dom";

import "../styles/_keyframe-animations.scss";
import "../styles/_variables.scss";

import { SimpleEditor } from "@/components/tiptap/tiptap-templates/simple/simple-editor";

/**
 * TiptapWrapper is a DOM component that runs Tiptap in a webview environment.
 * It triggers onReady when the editor is fully initialized.
 */
export default function TiptapWrapper({
  initialContent,
  onContentChange,
  onReady,
}: {
  initialContent: string;
  onContentChange?: (html: string) => void;
  onReady?: () => void;
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
        onUpdate={(content) => {
          if (onContentChange) {
            onContentChange(content);
          }
        }}
        onReady={() => {
          if (onReady) {
            onReady();
          }
        }}
      />
    </div>
  );
}
