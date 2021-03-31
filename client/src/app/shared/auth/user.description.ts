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
 *
 */
export function isUserResponse(obj: any): obj is UserDescription {
  return typeof obj === "object" && "userId" in obj;
}
