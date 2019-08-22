
export interface UserNameDescription {
  displayName: string;
}

export interface UserDescription {
  displayName: string;
  roles: string[];
  userId: string;
  email: string;
}

export interface UserAddEmailDescription {
  email: string;
  password: string;
}

export interface UserEmailDescription {
  email: string;
}

export type UserPasswordDescription = PasswordTokenDescription | PasswordConfirmedDescription | PasswordDescription;

export interface PasswordDescription {
  password: string;
}

export interface PasswordConfirmedDescription {
  password: string;
  confirmedPassword: string;
}

export interface PasswordTokenDescription {
  password: string;
  confirmedPassword: string;
  token: string;
}

