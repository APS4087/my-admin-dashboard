"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ResponsiveSidebarProviderProps {
  children: ReactNode;
  defaultOpen: boolean;
}

// Custom hook to manage responsive sidebar state
function useResponsiveSidebar(defaultOpen: boolean) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Function to check screen size and update sidebar state
    const updateSidebarState = () => {
      const wideScreen = window.innerWidth >= 1024; // lg breakpoint
      setIsWideScreen(wideScreen);

      if (wideScreen) {
        // On wide screens, always keep sidebar open
        setIsOpen(true);
      } else {
        // On smaller screens, use the user's preference
        setIsOpen(defaultOpen);
      }
    };

    // Set initial state
    updateSidebarState();

    // Listen for resize events with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSidebarState, 100);
    };

    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [defaultOpen]);

  return { isOpen, isWideScreen, mounted };
}

export function ResponsiveSidebarProvider({ children, defaultOpen }: ResponsiveSidebarProviderProps) {
  const { isOpen, isWideScreen, mounted } = useResponsiveSidebar(defaultOpen);

  // Prevent hydration mismatch by rendering with default state until mounted
  if (!mounted) {
    return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>;
  }

  return (
    <SidebarProvider
      defaultOpen={isOpen}
      // Disable manual toggle on wide screens by overriding the internal state
      {...(isWideScreen && {
        open: true,
        onOpenChange: () => {}, // Prevent closing on wide screens
      })}
    >
      {children}
    </SidebarProvider>
  );
}
