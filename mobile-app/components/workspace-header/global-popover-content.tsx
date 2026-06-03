import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useTeams } from "@/features/main/teams/use-teams";
import { useSignOut } from "@/features/user/use-sign-out";
import {
  Building2,
  LogOut,
  Plus,
  Settings,
  Users,
} from "@tamagui/lucide-icons-2";
import { useRouter } from "expo-router";
import React from "react";
import { Accordion, Separator, YStack } from "tamagui";
import AccordionSection from "./accordion-section";
import IconButton from "./icon-button";

export default function GlobalPopoverContent() {
  const router = useRouter();
  const { data: teamsData, isFetching: isLoadingTeams } = useTeams();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { teamId } = useCurrentTeamParams();

  return (
    <>
      <Accordion defaultValue={["settings"]} type="multiple">
        <AccordionSection value="settings" title="SETTINGS">
          <YStack>
            {/* <IconButton icon={Settings} label="App settings" /> */}
            {/* <IconButton icon={UserRoundCog} label="User settings" /> */}
            {teamId && (
              <IconButton
                onPress={() => router.push(`/teams/${teamId}/team-settings`)}
                icon={Settings}
                label="Team Settings"
              ></IconButton>
            )}
            <IconButton onPress={signOut} icon={LogOut} label="Sign out" />
          </YStack>
        </AccordionSection>

        <Separator marginVertical="$1" />

        <AccordionSection value="teams" title="MY TEAMS">
          <YStack>
            <IconButton
              icon={Plus}
              label="Create a team"
              onPress={() => router.push("/teams/create")}
            />

            <IconButton
              icon={Users}
              label="Join a team"
              onPress={() => router.push("/teams/join")}
            />

            {teamsData?.teams.map((team) => (
              <IconButton
                key={team.teamId}
                icon={Building2}
                label={team.name}
                onPress={() => router.push(`/teams/${team.teamId}`)}
              />
            ))}
          </YStack>
        </AccordionSection>
      </Accordion>
    </>
  );
}
