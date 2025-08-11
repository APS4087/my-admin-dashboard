"use client";

export function DebugEnv() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 max-w-sm rounded bg-black p-2 text-xs text-white">
      <div>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL ?? "undefined"}</div>
      <div>window.location.origin: {typeof window !== "undefined" ? window.location.origin : "undefined"}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
}
