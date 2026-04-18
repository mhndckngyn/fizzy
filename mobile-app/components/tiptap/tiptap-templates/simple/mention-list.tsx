import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { type EditorMentionItem } from "./mention-suggestion";

interface MentionListProps {
  items: EditorMentionItem[];
  command: (item: { id: string; label: string }) => void;
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset the selection whenever the filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      // Tiptap's Mention extension expects an 'id' and a 'label' by default.
      // We map your user's 'name' to the 'label' property here.
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length,
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  // This exposes the keyboard navigation methods to Tiptap's suggestion config
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div style={styles.container}>
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => selectItem(index)}
            style={styles.button}
          >
            {item.name}
          </button>
        ))
      ) : (
        <div style={styles.noResult}>No result</div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

const styles = {
  container: {
    background: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "0.9rem",
    overflow: "hidden",
    padding: "0.4rem",
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    minWidth: "200px",
    maxWidth: "200px",
  },
  button: {
    background: "transparent",
    border: "none",
    borderRadius: "0.4rem",
    display: "block",
    margin: 0,
    padding: "12px 16px",
    textAlign: "left" as const,
    width: "100%",
    color: "#111827",
  },
  noResult: {
    padding: "12px 16px",
    fontFamily: "system-ui",
    color: "#6b7280",
    textAlign: "center" as const,
  },
};

export default MentionList;
