
export type UserType = 'internal' | 'external';

export interface UserProfile {
  id: string;
  user_type: UserType;
  full_name: string | null;
  document_number: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
