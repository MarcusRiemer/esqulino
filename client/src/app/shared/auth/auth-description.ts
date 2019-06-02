

export interface SignUpDescription {
  email: string;
  username: string;
  password: string;
  retypedPassword: string;
}

export interface ProviderDescription {
  name: string;
  urlName: string;
}

export type AuthContentDescription = 'SignIn' | 'SignOut' | 'ResetPassword' | 'VerifyEmail'