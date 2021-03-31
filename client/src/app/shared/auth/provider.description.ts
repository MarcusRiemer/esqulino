/**
 * Identities and the primary e-mail of a user
 */
export interface ServerProviderDescription {
  providers: ProviderDescription[];
  primary: string | null;
}
/**
 * Information about a User linked identity
 */
export interface ProviderDescription {
  id: string;
  type: string;
  confirmed: boolean;
  link?: string;
  email?: string;
  access_token_duration?: string;
}

/**
 * The information for the representation
 * of a provider-button.
 */
export interface LoginProviderDescription {
  name: string;
  urlName: string;
  icon: string;
  color: string;
}
