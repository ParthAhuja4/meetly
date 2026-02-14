import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GeneratedAvatar from "@/components/ui/generated-avatar";

export default function DashboardUserButton() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const isMobile = useIsMobile();

  if (isPending || !data?.user) {
    return null;
  }

  return !isMobile ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
        <GeneratedAvatar variant="initials" seed={data.user.name} />
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-8">
          <p className="text-sm truncate w-full">{data.user.name}</p>
          <p className="text-xs truncate w-full">{data.user.email}</p>
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{data.user.name}</span>
            <span className="font-sm font-normal text-muted-foreground truncate">
              {data.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
          Billing <CreditCardIcon className="size-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center justify-between"
          onClick={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => router.push("/sign-in") },
            })
          }
        >
          Logout <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Drawer>
      <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
        <GeneratedAvatar variant="initials" seed={data.user.name} />
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-8">
          <p className="text-sm truncate w-full">{data.user.name}</p>
          <p className="text-xs truncate w-full">{data.user.email}</p>
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DrawerTrigger>
      <DrawerContent className="w-72">
        <DrawerHeader>
          <DrawerTitle>{data.user.name}</DrawerTitle>
          <DrawerDescription>{data.user.email}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="outline" onClick={() => {}}>
            <CreditCardIcon className="size-4 text-black" />
            Billing
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              authClient.signOut({
                fetchOptions: { onSuccess: () => router.push("/sign-in") },
              })
            }
          >
            <LogOutIcon className="size-4 text-black" />
            LogOut
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
