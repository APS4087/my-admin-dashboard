"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ className, children, maxWidth = "2xl", padding = "md", ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md", 
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full"
    };

    const paddingClasses = {
      none: "",
      sm: "p-4 md:p-6",
      md: "p-4 md:p-6 xl:p-8",
      lg: "p-4 md:p-6 xl:p-8 2xl:p-10",
      xl: "p-4 md:p-6 xl:p-8 2xl:p-12"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveContainer.displayName = "ResponsiveContainer";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    children, 
    cols = { default: 1, md: 2, lg: 3, xl: 4 },
    gap = "md",
    ...props 
  }, ref) => {
    const gapClasses = {
      none: "gap-0",
      sm: "gap-2 md:gap-4",
      md: "gap-4 md:gap-6",
      lg: "gap-4 md:gap-6 xl:gap-8",
      xl: "gap-4 md:gap-6 xl:gap-8 2xl:gap-10"
    };

    const gridCols: string[] = ["grid"];
    if (cols.default) gridCols.push(`grid-cols-${cols.default}`);
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    if (cols["2xl"]) gridCols.push(`2xl:grid-cols-${cols["2xl"]}`);

    return (
      <div
        ref={ref}
        className={cn(
          gridCols.join(" "),
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveGrid.displayName = "ResponsiveGrid";

interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "row" | "col";
  responsive?: boolean;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

const ResponsiveFlex = React.forwardRef<HTMLDivElement, ResponsiveFlexProps>(
  ({ 
    className, 
    children, 
    direction = "row",
    responsive = true,
    align = "center",
    justify = "start",
    gap = "md",
    ...props 
  }, ref) => {
    const gapClasses = {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8"
    };

    const alignClasses = {
      start: "items-start",
      center: "items-center", 
      end: "items-end",
      stretch: "items-stretch"
    };

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end", 
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    };

    const directionClasses = responsive 
      ? direction === "row" 
        ? "flex-col sm:flex-row" 
        : "flex-row sm:flex-col"
      : direction === "row"
        ? "flex-row"
        : "flex-col";

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses,
          alignClasses[align],
          justifyClasses[justify],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveFlex.displayName = "ResponsiveFlex";

export { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex };
