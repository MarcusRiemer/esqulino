export interface SignUpDescription {
  email: string;
  username: string;
  password: string;
}

export interface SignInDescription {
  email: string;
  password: string;
}

export interface ProviderDescription {
  name: string;
  urlName: string;
}

export interface ChangePasswordDescription {
  currentPassword: string;
  newPassword: string;
}
