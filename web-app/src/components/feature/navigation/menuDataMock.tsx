import { Plus, LayoutTemplate, Tag, UserPlus, User, Home } from "lucide-react";

export const MENU_DATA_MOCK = [
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

export const MENU_BUTTON_DATA_MOCK = [
  {
    id: "home-button",
    text: "Home",
    icon: <Home />,
  },
  {
    id: "assign-button",
    text: "Assigned to me",
    icon: <LayoutTemplate />,
  },
  {
    id: "add-button",
    text: "Added by me",
    icon: <UserPlus />,
  },
];
