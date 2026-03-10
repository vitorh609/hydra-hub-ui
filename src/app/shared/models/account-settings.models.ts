export interface AccountProfileFormValue {
  avatarBase64: string | null;
}

export interface AccountPasswordFormValue {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountPersonalDetailsFormValue {
  name: string;
  storeName: string;
  location: string;
  currency: string;
  email: string;
  phone: string;
  address: string;
}

export interface AccountSettings {
  userId: string;
  avatarBase64: string | null;
  name: string;
  storeName: string | null;
  location: string | null;
  currency: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSettingsCreate {
  userId?: string;
  avatarBase64: string | null;
  name: string;
  storeName?: string | null;
  location: string | null;
  currency?: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}
