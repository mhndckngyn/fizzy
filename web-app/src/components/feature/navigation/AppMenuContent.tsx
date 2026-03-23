"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CommandGroup, CommandItem, useCommandState } from "cmdk";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { MENU_DATA_MOCK } from "./menuDataMock";
import React, { useState } from "react";

const teamName = "Team name";

// Main menu content component
const AppMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const menuData = MENU_DATA_MOCK;

  return (
    <Card ref={ref} {...props}>
      <CardHeader>
        <CardTitle className="text-center text-xl">{teamName}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Command className="gap-4">
          <CommandInput placeholder="Type to jump to a board, person, place, or tag..." />
          <CommandList>
            {/* No results found */}
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup className="**:[[cmdk-group-items]]:flex **:[[cmdk-group-items]]:flex-nowrap **:[[cmdk-group-items]]:justify-center **:[[cmdk-group-items]]:gap-2 **:[[cmdk-group-items]]:overflow-x-auto">
              <CommandItem asChild>
                <MenuButton text="Item 1" />
              </CommandItem>
              <CommandItem asChild>
                <MenuButton text="Item 2" />
              </CommandItem>
              <CommandItem asChild>
                <MenuButton text="Item 3" />
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              {menuData.map((group) => (
                <MenuCollapsible
                  key={group.id}
                  title={group.title}
                  items={group.items}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  );
});

AppMenuContent.displayName = "AppMenuContent";

export default AppMenuContent;

// Menu button
interface MenuButtonProps {
  text: string;
  icon?: React.ReactNode;
}
const MenuButton = ({ text, icon }: MenuButtonProps) => {
  return (
    <Button
      variant="default"
      size="lg"
      className="h-auto max-w-30 min-w-10 flex-1"
    >
      {icon}
      <span className="text-sm font-bold">{text}</span>
    </Button>
  );
};

// Collapsible menu item
export interface MenuCollapsibleItemProps {
  id: string;
  text: string;
  icon: React.ReactNode;
}
interface MenuCollapsibleProps {
  title: string;
  items: MenuCollapsibleItemProps[];
}
const MenuCollapsible = ({ title, items }: MenuCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const search = useCommandState((state) => state.search);

  const keyword = search.trim().toLowerCase();
  // check trong mảng items có cái nào khớp với keyword
  const hasMatch = items.some((item) =>
    item.text.toLowerCase().includes(keyword),
  );
  // ko có item khớp với keyword => ko render
  if (keyword.length > 0 && !hasMatch) {
    return null;
  }
  // default: có kết quả thì tự động mở ra
  const forceOpen = keyword.length > 0 ? true : isOpen;
  return (
    <Collapsible open={forceOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="menuItem" size="sm" className="group">
          <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
          {title}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3">
        {items.map((item) => (
          <CommandItem key={item.id} value={item.text} asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="#">
                {item.icon}
                {item.text}
              </Link>
            </Button>
          </CommandItem>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
