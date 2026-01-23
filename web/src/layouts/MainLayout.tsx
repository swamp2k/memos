import { useEffect, useMemo, useState } from "react";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import type { MemoExplorerContext } from "@/components/MemoExplorer";
import { MemoExplorer, MemoExplorerDrawer } from "@/components/MemoExplorer";
import MobileHeader from "@/components/MobileHeader";
import { userServiceClient } from "@/connect";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFilteredMemoStats } from "@/hooks/useFilteredMemoStats";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Routes } from "@/router";

const MainLayout = () => {
  const md = useMediaQuery("md");
  const lg = useMediaQuery("lg");
  const location = useLocation();
  const currentUser = useCurrentUser();
  const [profileUserName, setProfileUserName] = useState<string | undefined>();

  // Determine context based on current route
  const context: MemoExplorerContext = useMemo(() => {
    if (location.pathname === Routes.ROOT) return "home";
    const profileMatch = matchPath("/u/:username", location.pathname);
    if (profileMatch) {
      setProfileUserName((profileMatch.params as { username?: string }).username);
      return "profile";
    }
    if (location.pathname.startsWith("/archived")) return "archived";
    if (location.pathname.startsWith("/explore")) return "explore";
    return "home";
  }, [location.pathname, context]);

  // Determine which user name to use for stats
  const statsUserName = useMemo(() => {
    if (context === "home") {
      return currentUser?.name;
    } else if (context === "profile") {
      return profileUserName;
    }
    return undefined;
  }, [context, currentUser, profileUserName]);

  const { statistics, tags } = useFilteredMemoStats({ userName: statsUserName });

  return (
    <section className="@container w-full min-h-full flex flex-col justify-start items-center">
      {/* Mobile header & drawer */}
      {!md && (
        <MobileHeader>
          <MemoExplorerDrawer context={context} statisticsData={statistics} tagCount={tags} />
        </MobileHeader>
      )}

      {/* Desktop / tablet sidebar: moved to the right */}
      {md && (
        <div
          className={cn(
            // position the fixed sidebar on the right instead of left
            "fixed top-0 right-16 shrink-0 h-svh transition-all",
            // use left border when sidebar is on the right
            "border-l border-border",
            lg ? "w-72" : "w-56",
          )}
        >
          <MemoExplorer className={cn("px-3 py-6")} context={context} statisticsData={statistics} tagCount={tags} />
        </div>
      )}

      {/* Main content: switch left padding to right padding to account for right sidebar */}
      <div className={cn("w-full min-h-full", lg ? "pr-72" : md ? "pr-56" : "")}> 
        <div className={cn("w-full mx-auto px-4 sm:px-6 md:pt-6 pb-8")}> 
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default MainLayout;