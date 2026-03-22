import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CommandGroup, CommandItem } from "cmdk";

const teamName = "Team name";

export default function AppMenuContent() {
  return (
    <Card className="w-97 gap-2 sm:w-120">
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
              <CommandItem asChild>
                <div> Item 1</div>
              </CommandItem>
              <CommandItem asChild>
                <div> Item 2</div>
              </CommandItem>
              <CommandItem asChild>
                <div> Item 3</div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  );
}

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
