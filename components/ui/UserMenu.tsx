"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, LogOut, LayoutGrid } from "lucide-react";
import { doSignOut } from "@/app/actions/auth";

export function UserMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();
  const [isPending, startTransition] = React.useTransition();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {image ? (
            <Image src={image} alt="" width={36} height={36} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[70] min-w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-[var(--fg)]">{name ?? "Account"}</p>
            {email && <p className="truncate text-xs text-[var(--muted)]">{email}</p>}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none transition data-[highlighted]:bg-[var(--surface-2)]"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/pricing"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none transition data-[highlighted]:bg-[var(--surface-2)]"
            >
              <LayoutGrid className="h-4 w-4" /> Pricing
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
          <DropdownMenu.Item
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--danger)] outline-none transition data-[highlighted]:bg-[var(--surface-2)] data-[disabled]:opacity-50"
            disabled={isPending}
            onSelect={(e) => {
              e.preventDefault();
              startTransition(() => {
                doSignOut();
              });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}