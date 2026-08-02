import { FIELD_META } from "@/lib/fields";
import type { FieldId } from "@/lib/types";

function escapeVCardText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/**
 * Builds the vCard 3.0 `N` (structured name) value: FamilyName;GivenName;;;
 * `N` is required by the vCard spec — without it, some contact apps (notably
 * iOS Contacts) silently drop the name even though `FN` is present.
 */
function structuredName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return ";;;;";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return `${escapeVCardText(parts[0])};;;;`;
  const family = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(" ");
  return `${escapeVCardText(family)};${escapeVCardText(given)};;;`;
}

export interface VCardInfo {
  name: string;
  title?: string;
  company?: string;
}

export function buildVCardText(
  info: VCardInfo,
  values: Partial<Record<FieldId, string>>,
  selectedFields: FieldId[]
): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${structuredName(info.name || "")}`,
    `FN:${escapeVCardText(info.name || "")}`,
  ];
  if (info.company) lines.push(`ORG:${escapeVCardText(info.company)}`);
  if (info.title) lines.push(`TITLE:${escapeVCardText(info.title)}`);

  for (const id of selectedFields) {
    const value = values[id];
    if (!value) continue;
    switch (id) {
      case "phone":
        lines.push(`TEL;TYPE=CELL:${escapeVCardText(value)}`);
        break;
      case "email":
        lines.push(`EMAIL:${escapeVCardText(value)}`);
        break;
      case "linkedin":
        lines.push(`URL;TYPE=LinkedIn:https://${value.replace(/^https?:\/\//i, "")}`);
        break;
      case "instagram":
        lines.push(`URL;TYPE=Instagram:https://instagram.com/${value.replace(/^@/, "")}`);
        break;
      case "facebook":
        lines.push(`URL;TYPE=Facebook:https://${value.replace(/^https?:\/\//i, "")}`);
        break;
      case "kakao":
        lines.push(`URL;TYPE=KakaoTalk:${/^https?:\/\//i.test(value) ? value : `https://${value}`}`);
        break;
    }
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function vcardFilename(name: string): string {
  const safe = (name || "contact").trim().replace(/[\\/:*?"<>|]/g, "");
  return `${safe || "contact"}.vcf`;
}

export const ALL_FIELD_IDS = Object.keys(FIELD_META) as FieldId[];
