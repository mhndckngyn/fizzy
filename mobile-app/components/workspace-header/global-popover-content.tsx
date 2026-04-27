import { useTeams } from "@/features/main/teams/use-teams";
import { useSignOut } from "@/features/user/hooks";
import {
  Building2,
  LogOut,
  Plus,
  Settings,
  UserRoundCog,
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

  return (
    <>
      <Accordion defaultValue={["teams", "settings"]} type="multiple">
        <AccordionSection value="teams" title="MY TEAMS">
          <YStack>
            <IconButton
              icon={Plus}
              label="Create a team"
              onPress={() => router.push("/teams/create")}
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

        <Separator marginVertical="$1" />

        <AccordionSection value="settings" title="SETTINGS">
          <YStack>
            <IconButton icon={Settings} label="App settings" />
            <IconButton icon={UserRoundCog} label="User settings" />
            <IconButton onPress={signOut} icon={LogOut} label="Sign out" />
          </YStack>
        </AccordionSection>
      </Accordion>
    </>
  );
}
