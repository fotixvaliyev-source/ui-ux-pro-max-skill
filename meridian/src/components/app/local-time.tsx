"use client";

import { useEffect, useState } from "react";

const FORMATS = {
  full: { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
  short: { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
  date: { day: "numeric", month: "short", year: "numeric" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/** Formats an instant in the viewer's own time zone. Renders UTC on the server and the first paint, then switches. */
export function LocalTime({ iso, format = "full" }: { iso: string; format?: keyof typeof FORMATS }) {
  const [text, setText] = useState(() => new Date(iso).toLocaleString("en-GB", { ...FORMATS[format], timeZone: "UTC" }) + (format === "date" ? "" : " UTC"));
  useEffect(() => {
    setText(new Date(iso).toLocaleString("en-GB", FORMATS[format]));
  }, [iso, format]);
  return <time dateTime={iso}>{text}</time>;
}
