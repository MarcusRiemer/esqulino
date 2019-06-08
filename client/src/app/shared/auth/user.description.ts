export type UserDescription = UserLoggedInDescription | UserLoggedOutDescription

export interface UserLoggedInDescription {
  displayName: string;
  loggedIn: true;
}

export interface UserLoggedOutDescription {
  loggedIn: false;
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

export interface PasswordTokenDescription{
  email: string;
  password: string;
  confirmedPassword: string;
  token: string;
}

