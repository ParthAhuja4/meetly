"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import DashboardUserButton from "./dashboard-user-button";

export type section = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
  label: string;
};

const firstSection: Array<section> = [
  {
    icon: VideoIcon,
    href: "/meetings",
    label: "Meetings",
  },
  { icon: BotIcon, href: "/agents", label: "Agents" },
];
const secondSection: Array<section> = [
  {
    icon: StarIcon,
    href: "/upgrade",
    label: "Upgrade",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.svg" height={36} width={36} alt="Meetly" />
          <p className="text-2xl font-semibold">Meetly</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2"></div>
      <Separator className="opacity-10 text-[#5D6B68]" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}
                    asChild
                    isActive={item.href === pathname}
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                      `${item.href === pathname ? "bg-linear-to-r/oklch border-[#5D6B68]/10" : ""}`,
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="opacity-10 text-[#5D6B68]" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}
                    asChild
                    isActive={item.href === pathname}
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                      `${item.href === pathname ? "bg-linear-to-r/oklch border-[#5D6B68]/10" : ""}`,
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
