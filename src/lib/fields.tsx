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
    label: "카카오톡 오픈채팅",
    icon: MessageCircle,
    color: "var(--color-kakao)",
    placeholder: "https://open.kakao.com/o/...",
  },
  instagram: {
    id: "instagram",
    label: "인스타그램",
    icon: Camera,
    color: "var(--color-instagram)",
    placeholder: "@username",
  },
  linkedin: {
    id: "linkedin",
    label: "링크드인",
    icon: Briefcase,
    color: "var(--color-linkedin)",
    placeholder: "linkedin.com/in/username",
  },
  facebook: {
    id: "facebook",
    label: "페이스북",
    icon: ThumbsUp,
    color: "var(--color-facebook)",
    placeholder: "facebook.com/username",
  },
  phone: {
    id: "phone",
    label: "전화번호",
    icon: Phone,
    color: "var(--color-phone)",
    placeholder: "010-1234-5678",
  },
  email: {
    id: "email",
    label: "이메일",
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

/** 채널 값을 실제로 열 수 있는 링크로 정규화 (딥링크/웹 fallback 동일 URL 사용) */
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
