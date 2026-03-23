import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AppMenuContent from "./AppMenuContent";

export default function AppMenuPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">Fizzy</Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-97 gap-2 sm:w-110"
        side="bottom"
        align="center"
        sideOffset={-30}
        asChild
      >
        <AppMenuContent />
      </PopoverContent>
    </Popover>
  );
}
