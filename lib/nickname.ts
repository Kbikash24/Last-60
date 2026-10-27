const BLOCKED = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigg",
  "fag",
  "rape",
  "nazi",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "whore",
  "slut",
];

export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 12;

export type NicknameResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Shared by the form and the API so both enforce the same rules. */
export function validateNickname(raw: unknown): NicknameResult {
  if (typeof raw !== "string") return { ok: false, error: "Enter a nickname." };
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length < NICKNAME_MIN || value.length > NICKNAME_MAX) {
    return {
      ok: false,
      error: `Nickname must be ${NICKNAME_MIN}-${NICKNAME_MAX} characters.`,
    };
  }
  if (!/^[A-Za-z0-9 _.-]+$/.test(value)) {
    return { ok: false, error: "Use letters, numbers, spaces, . _ or - only." };
  }
  const flat = value
    .toLowerCase()
    .replace(/[\s_.-]/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s");
  if (BLOCKED.some((w) => flat.includes(w)))
    return { ok: false, error: "Please choose a different nickname." };
  return { ok: true, value };
}
