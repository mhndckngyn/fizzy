import { useBoards } from "@/features/main/boards/use-boards";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";
import { useMembers } from "@/features/main/members/use-members";
import { useTags } from "@/features/main/tags/use-list-tags";
import {
  ClipboardList,
  Home,
  Kanban,
  Plus,
  Search,
  Tag,
  User,
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
  const { data: membersData } = useMembers();
  const currentMemberId = useCurrentMemberStore(
    (s) => s.currentMember?.memberId,
  );

  const { data: tagsData } = useTags(teamId);

  return (
    <>
      <Input
        placeholder="Search a board, person, place, or tag..."
        placeholderTextColor="$color8"
        backgroundColor="$backgroundHover"
        size="$4"
      />

      <YStack mt="$4" gap="$2" width="100%">
        {/* Row 1 */}
        <XStack gap="$2" justifyContent="space-between">
          <NavButton
            active
            onPress={() => router.push(`/teams/${teamId}`)}
            icon={Home}
            label="Home"
          />
          <NavButton
            icon={Search}
            label="Search"
            onPress={() =>
              router.push({
                pathname: "/teams/[teamId]/filter-cards",
                params: {
                  teamId,
                },
              })
            }
          />
        </XStack>

        {/* Row 2 */}
        <XStack gap="$2" justifyContent="space-between">
          <NavButton
            icon={ClipboardList}
            label="Assigned To Me"
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
            label="Added By Me"
            onPress={() =>
              router.push({
                pathname: "/teams/[teamId]/filter-cards",
                params: {
                  teamId,
                  ...(currentMemberId && {
                    initialAddedByIds: currentMemberId,
                  }),
                },
              })
            }
          />
        </XStack>
      </YStack>

      <Accordion
        mt="$2"
        defaultValue={["boards", "people", "tags"]}
        type="multiple"
      >
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

        <AccordionSection value="tags" title="TAGS">
          {tagsData?.map((tag) => (
            <IconButton
              key={tag.tagId}
              icon={Tag}
              label={tag.title}
              onPress={() =>
                router.push({
                  pathname: "/teams/[teamId]/filter-cards",
                  params: { teamId, initialTagIds: tag.tagId },
                })
              }
            />
          ))}
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
