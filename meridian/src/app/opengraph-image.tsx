import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card, drawn with the brand palette. No external assets. */
export default function OpengraphImage() {
  const chip = (bg: string, label: string) => (
    <div style={{ display: "flex", background: bg, border: "4px solid #1B1A2E", borderRadius: 999, padding: "10px 26px", fontSize: 30, fontWeight: 700, color: "#1B1A2E" }}>{label}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFF9F0", padding: 72, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: 999, background: "#B58CFF", opacity: 0.55 }} />
        <div style={{ position: "absolute", right: 160, bottom: -160, width: 380, height: 380, borderRadius: 999, background: "#3DD6A4", opacity: 0.45 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 76, height: 76, alignItems: "center", justifyContent: "center", background: "#4B3BD6", border: "5px solid #1B1A2E", borderRadius: 22, color: "#fff", fontSize: 46, fontWeight: 800 }}>M</div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: "#1B1A2E" }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.02, color: "#1B1A2E", maxWidth: 900 }}>{SITE_TAGLINE}</div>
          <div style={{ display: "flex", gap: 16 }}>
            {chip("#FFE4DF", "Goals")}
            {chip("#E6E3FF", "Meetings")}
            {chip("#FFF1BF", "Decisions")}
            {chip("#D5F6EA", "Opportunities")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
