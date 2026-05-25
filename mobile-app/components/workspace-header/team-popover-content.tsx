import { useBoards } from "@/features/main/boards/use-boards";
import {
  ClipboardList,
  Home,
  Kanban,
  Plus,
  User,
  UserPlus,
  UserRound,
} from "@tamagui/lucide-icons-2";
import { useRouter } from "expo-router";
import { Accordion, Input, Separator, XStack, YStack } from "tamagui";
import AccordionSection from "./accordion-section";
import IconButton from "./icon-button";
import NavButton from "./nav-button";
import { useMembers } from "@/features/main/members/use-members";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";

interface Props {
  teamId: string;
}

export default function TeamPopoverContent({ teamId }: Props) {
  const router = useRouter();
  const { data: boardsData, isFetching: isLoadingTeams } = useBoards();
  const { data: membersData } = useMembers();
  const currentMemberId = useCurrentMemberStore(
    (s) => s.currentMember?.memberId,
  );

  return (
    <>
      <Input
        placeholder="Search a board, person, place, or tag..."
        placeholderTextColor="$color8"
        backgroundColor="$backgroundHover"
        size="$4"
      />

      <XStack mt="$4" gap="$2" justifyContent="space-between">
        <NavButton
          active
          onPress={() => router.push(`/teams/${teamId}`)}
          icon={Home}
          label="Home"
        />
        <NavButton
          icon={ClipboardList}
          label="Assigned"
          onPress={() =>
            router.push({
              pathname: "/teams/[teamId]/filter-cards",
              params: {
                teamId,
                ...(currentMemberId && {
                  initialAssignedToIds: currentMemberId,
                }),
              },
            })
          }
        />
        <NavButton
          icon={Plus}
          label="Added"
          onPress={() =>
            router.push({
              pathname: "/teams/[teamId]/filter-cards",
              params: {
                teamId,
                ...(currentMemberId && { initialAddedByIds: currentMemberId }),
              },
            })
          }
        />
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
                key={board.boardId}
                icon={Kanban}
                label={board.name}
                onPress={() =>
                  router.push(`/teams/${teamId}/boards/${board.boardId}`)
                }
              />
            ))}
          </YStack>
        </AccordionSection>

        <Separator marginVertical="$1" />

        <AccordionSection value="people" title="MEMBERS">
          <YStack>
            <IconButton
              icon={Plus}
              label="Invite people"
              onPress={() =>
                router.push({
                  pathname: "/teams/[teamId]/team-settings",
                  params: { teamId },
                })
              }
            />
          </YStack>

          {membersData?.members.map((member) => (
            <IconButton
              key={member.memberId}
              icon={User}
              label={member.memberName}
              onPress={() =>
                router.push({
                  pathname: "/teams/[teamId]/members/[memberId]",
                  params: { teamId, memberId: member.memberId },
                })
              }
            />
          ))}
        </AccordionSection>

        <Separator marginVertical="$1" />
      </Accordion>
    </>
  );
}
