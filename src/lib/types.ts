export type WeddingStatus = "draft" | "published" | "expired";

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export interface TimelineEntry {
  ano: string;
  titulo: string;
  texto: string;
}

export interface ScheduleEntry {
  hora: string;
  evento: string;
}

export interface PlaceInfo {
  local: string;
  endereco: string;
  horario: string;
  maps: string;
}

export interface Wedding {
  id: string;
  owner_id: string;
  slug: string;
  couple_names: string | null;
  story: string | null;
  event_date: string | null; // ISO date
  event_location: string | null;
  event_details: string | null;
  cover_photo_url: string | null;
  theme: string;
  custom_accent: string | null;
  pix_key: string | null;
  pix_key_type: PixKeyType | null;
  pix_recipient_name: string | null;
  pix_city: string | null;
  // Novas seções
  monogram_left: string | null;
  monogram_right: string | null;
  verse: string | null;
  verse_ref: string | null;
  dress_code: string | null;
  ceremony: PlaceInfo | null;
  reception: PlaceInfo | null;
  show_reception: boolean;
  story_timeline: TimelineEntry[];
  schedule: ScheduleEntry[];
  show_schedule: boolean;
  status: WeddingStatus;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rsvp {
  id: string;
  wedding_id: string;
  name: string;
  attending: boolean;
  companions: number;
  message: string | null;
  created_at: string;
}

export interface Gift {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  suggested_amount: number | null; // em centavos
  is_honeymoon_fund: boolean;
  sort_order: number;
  created_at: string;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
  id: string;
  wedding_id: string;
  abacatepay_billing_id: string | null;
  amount: number; // em centavos
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}
