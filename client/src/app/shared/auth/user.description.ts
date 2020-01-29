
/**
 * is used to change the username
 */
export interface UserNameDescription {
  displayName: string;
}

/**
 * The description contains the most
 * important information about a USER.
 */
export interface UserDescription {
  displayName: string;
  roles: string[];
  userId: string;
  email?: string;
}

/**
 * Adding a password identity.
 * If there's already an existing password identity,
 * the password will be empty
 */
export interface UserAddEmailDescription {
  email: string;
  password: string;
}

/**
 * The UserEmailDescription will be used,
 * if primarily the email is transfered.
 * Example: password reset, sending verification link again
 */
export interface UserEmailDescription {
  email: string;
}

/**
 * If the password is being reset, a token will be created.
 * This token is used to to reset the password.
 * The new password will be sent to the server, together with the newly created token.
 * */
export type UserPasswordDescription = {
  password: string;
  confirmedPassword: string;
  token: string;
}

/**
 *
 */
export function isUserResponse(obj: any): obj is UserDescription {
  return typeof obj === "object" && 'userId' in obj;
}