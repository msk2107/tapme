import {
  Camera,
  Briefcase,
  ThumbsUp,
  Phone,
  Mail,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { FieldId, Profile } from "@/lib/types";

export interface FieldMeta {
  id: FieldId;
  label: string;
  icon: LucideIcon;
  color: string;
  placeholder: string;
}

export const FIELD_ORDER: FieldId[] = [
  "kakao",
  "instagram",
  "linkedin",
  "facebook",
  "phone",
  "email",
];

export const FIELD_META: Record<FieldId, FieldMeta> = {
  kakao: {
    id: "kakao",
    label: "KakaoTalk Open Chat",
    icon: MessageCircle,
    color: "var(--color-kakao)",
    placeholder: "https://open.kakao.com/o/...",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    icon: Camera,
    color: "var(--color-instagram)",
    placeholder: "@username",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    icon: Briefcase,
    color: "var(--color-linkedin)",
    placeholder: "linkedin.com/in/username",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    icon: ThumbsUp,
    color: "var(--color-facebook)",
    placeholder: "facebook.com/username",
  },
  phone: {
    id: "phone",
    label: "Phone",
    icon: Phone,
    color: "var(--color-phone)",
    placeholder: "+1 555-123-4567",
  },
  email: {
    id: "email",
    label: "Email",
    icon: Mail,
    color: "var(--color-email)",
    placeholder: "you@example.com",
  },
};

export function fieldValue(profile: Pick<Profile, FieldValueKeys>, id: FieldId): string {
  return profile[`${id}_value`] ?? "";
}

export function fieldVisible(profile: Pick<Profile, FieldVisibleKeys>, id: FieldId): boolean {
  return profile[`${id}_visible`] ?? false;
}

type FieldValueKeys = `${FieldId}_value`;
type FieldVisibleKeys = `${FieldId}_visible`;

export function visibleFieldIds(profile: Profile): FieldId[] {
  return FIELD_ORDER.filter((id) => fieldVisible(profile, id) && fieldValue(profile, id).trim());
}

/** Normalizes a channel value into an openable link (same URL doubles as deep link and web fallback) */
export function channelHref(id: FieldId, value: string): string {
  const v = value.trim();
  if (!v) return "#";
  switch (id) {
    case "phone":
      return `tel:${v.replace(/\s+/g, "")}`;
    case "email":
      return `mailto:${v}`;
    case "kakao":
      return /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
    case "instagram": {
      const handle = v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
      return `https://instagram.com/${handle}`;
    }
    case "linkedin": {
      const clean = v.replace(/^https?:\/\//i, "");
      return `https://${clean}`;
    }
    case "facebook": {
      const clean = v.replace(/^https?:\/\//i, "");
      return `https://${clean}`;
    }
    default:
      return v;
  }
}
