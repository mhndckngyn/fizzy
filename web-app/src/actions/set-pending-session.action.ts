"use server";

import { setPendingAuthSession } from "@/lib/session";

export async function savePendingEmailAction(email: string) {
  await setPendingAuthSession(email);
}
