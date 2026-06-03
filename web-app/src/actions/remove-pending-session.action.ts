"use server";

import { clearPendingAuthSession } from "@/lib/session";

export async function removePendingEmailAction() {
  await clearPendingAuthSession();
}
