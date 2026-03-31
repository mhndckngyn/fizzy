import { useBoards } from "@/features/main/boards/hooks";
import {
  ClipboardList,
  Home,
  Kanban,
  Plus,
  UserPlus,
} from "@tamagui/lucide-icons-2";
import { useRouter } from "expo-router";
import { Accordion, Input, Separator, XStack, YStack } from "tamagui";
import AccordionSection from "./accordion-section";
import IconButton from "./icon-button";
import NavButton from "./nav-button";

interface Props {
  teamId: string;
}

export default function TeamPopoverContent({ teamId }: Props) {
  const router = useRouter();
  const { data: boardsData, isFetching: isLoadingTeams } = useBoards();

  return (
    <>
      <Input
        placeholder="Search a board, person, place, or tag..."
        placeholderTextColor="$color8"
        backgroundColor="$backgroundHover"
        size="$4"
      />

      <XStack mt="$4" gap="$2" justifyContent="space-between">
        <NavButton icon={Home} label="Home" active />
        <NavButton icon={ClipboardList} label="Tasks" />
        <NavButton icon={UserPlus} label="Members" />
      </XStack>

      <Accordion mt="$2" defaultValue={["boards", "people"]} type="multiple">
        <AccordionSection value="boards" title="BOARDS">
          <YStack>
            <IconButton
              icon={Plus}
              label="Add a board"
              onPress={() => router.push(`/teams/${teamId}/boards/create`)}
            />

            {boardsData?.boards.map((board) => (
              <IconButton
                key={board.id}
                icon={Kanban}
                label={board.name}
                onPress={() =>
                  router.push(`/teams/${teamId}/boards/${board.id}`)
                }
              />
            ))}
          </YStack>
        </AccordionSection>

        <Separator marginVertical="$1" />

        <AccordionSection value="people" title="MEMBERS">
          <YStack>
            <IconButton icon={Plus} label="Invite people" />
          </YStack>
        </AccordionSection>

        <Separator marginVertical="$1" />
      </Accordion>
    </>
  );
}
