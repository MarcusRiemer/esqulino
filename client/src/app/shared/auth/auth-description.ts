

export interface SignUpDescription {
  email: string;
  username: string;
  password: string;
  retypedPassword: string;
}

export interface SignInDescription {
  email: string;
  password: string;
}

export interface ProviderDescription {
  name: string;
  urlName: string;
}