export type FieldId =
  | "kakao"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "phone"
  | "email";

export interface Profile {
  id: string;
  username: string;
  name: string;
  title: string;
  company: string;
  avatar_url: string | null;
  is_admin: boolean;
  signup_number: number;
  current_event_id: string | null;
  current_event_banner_dismissed_for: string | null;
  kakao_value: string;
  kakao_visible: boolean;
  instagram_value: string;
  instagram_visible: boolean;
  linkedin_value: string;
  linkedin_visible: boolean;
  facebook_value: string;
  facebook_visible: boolean;
  phone_value: string;
  phone_visible: boolean;
  email_value: string;
  email_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  source: string;
  external_id: string | null;
  is_partner: boolean;
  created_at: string;
}

export interface ExchangeRow {
  id: string;
  card_owner_id: string;
  viewer_id: string | null;
  viewer_name: string | null;
  event_name: string | null;
  saved_fields: string[];
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  message: string;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface FeatureFlagRow {
  id: string;
  key: string;
  enabled: boolean;
  rollout_percent: number;
  created_at: string;
}

export interface FeedbackRow {
  id: string;
  profile_id: string;
  viewer_id: string | null;
  message: string;
  created_at: string;
}
