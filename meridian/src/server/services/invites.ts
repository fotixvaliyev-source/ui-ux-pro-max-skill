import { randomInt } from "node:crypto";
import { INVITE_CODE_LENGTH } from "@/server/validation/circle";

/** No 0/O/1/I/L: codes get read aloud and typed on phones. */
export const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  let out = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) out += INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)];
  return out;
}
