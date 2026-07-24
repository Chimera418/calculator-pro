"use server";

import { signOut } from "@/features/auth/config";

export async function doSignOut() {
  await signOut({ redirectTo: "/" });
}