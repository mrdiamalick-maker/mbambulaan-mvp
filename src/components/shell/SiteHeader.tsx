"use client";

import { Bell, LogOut, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function SiteHeader({
  title,
  subtitle,
  actorName,
  unread,
  persistence,
  onReset,
  onLogout
}: {
  title: string;
  subtitle?: string;
  actorName?: string;
  unread: number;
  persistence: string;
  onReset?: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="outline" className="hidden gap-1.5 xl:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {persistence === "postgresql" ? "Base de production" : "Environnement de démonstration"}
        </Badge>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${unread} notifications non lues`}>
          <Bell />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-background bg-destructive" />}
        </Button>
        {onReset && (
          <Button variant="outline" size="icon" onClick={onReset} title="Réinitialiser la démonstration" aria-label="Réinitialiser la démonstration">
            <RotateCcw />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{actorName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{actorName ?? "Mon compte"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} variant="destructive">
              <LogOut /> Quitter l’espace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
