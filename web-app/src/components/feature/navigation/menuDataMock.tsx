import { Plus, LayoutTemplate, Tag, UserPlus, User } from "lucide-react";
import { MenuCollapsibleItemProps } from "./AppMenuContent";

// TODO: replace it with actual data source or API calls.

export interface MenuGroupData {
  id: string;
  title: string;
  items: MenuCollapsibleItemProps[];
}

export const MENU_DATA_MOCK: MenuGroupData[] = [
  {
    id: "group-boards",
    title: "BOARDS",
    items: [
      {
        id: "board-add",
        text: "Add a board",
        icon: <Plus />,
      },
      {
        id: "board-feature-priority",
        text: "Feature Priority",
        icon: <LayoutTemplate />,
      },
      {
        id: "board-task-tracker",
        text: "Task Tracker",
        icon: <LayoutTemplate />,
      },
      {
        id: "board-playground",
        text: "Playground",
        icon: <LayoutTemplate />,
      },
    ],
  },
  {
    id: "group-tags",
    title: "TAGS",
    items: [
      {
        id: "tag-design",
        text: "design",
        icon: <Tag />,
      },
      {
        id: "tag-mobile",
        text: "mobile",
        icon: <Tag />,
      },
      {
        id: "tag-web",
        text: "web",
        icon: <Tag />,
      },
    ],
  },
  {
    id: "group-people",
    title: "PEOPLE",
    items: [
      {
        id: "people-invite",
        text: "Invite people",
        icon: <UserPlus />,
      },
      {
        id: "people-ak",
        text: "AK",
        icon: <User />,
      },
      {
        id: "people-alex",
        text: "AlexNguyen07",
        icon: <User />,
      },
    ],
  },
];
