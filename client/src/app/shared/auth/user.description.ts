export type UserDescription = UserLoggedInDescription | UserLoggedOutDescription

export interface UserLoggedInDescription {
  displayName: string;
  loggedIn: true;
}

export interface UserLoggedOutDescription {
  loggedIn: false;
} 
