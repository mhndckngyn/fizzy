import { computePosition, flip, shift } from "@floating-ui/dom";
import { posToDOMRect, ReactRenderer } from "@tiptap/react";
import { MentionList } from "./mention-list";

export type EditorMentionItem = {
  id: string;
  name: string;
};

const updatePosition = (editor: any, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  };

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = "max-content";
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
};

const sharedConfig = (mentionData: EditorMentionItem[]) => ({
  items: ({ query }: { query: string }) => {
    return mentionData
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  },
  allowSpaces: true,
  render: () => {
    let component: ReactRenderer<any>;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        component.element.style.position = "absolute";
        document.body.appendChild(component.element);
        updatePosition(props.editor, component.element);
      },

      onUpdate(props: any) {
        component.updateProps(props);
        if (!props.clientRect) return;
        updatePosition(props.editor, component.element);
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          component.destroy();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        component.element.remove();
        component.destroy();
      },
    };
  },
});

export const createMemberMentionSuggestion = (
  memberList: EditorMentionItem[],
) => ({
  char: "@",
  ...sharedConfig(memberList),
});

export const createCardMentionSuggestion = (cardList: EditorMentionItem[]) => ({
  char: "#",
  ...sharedConfig(cardList),
});
