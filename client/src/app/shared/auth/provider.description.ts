export interface ServerProviderDescription {
  providers: ProviderDescription[];
  primary: string | null;
}
export interface ProviderDescription {
  id: string;
  type: string;
  confirmed: boolean;
  link?: string;
  email?: string;
}

export interface ChangePrimaryEmailDescription {
  primaryEmail: string;
}

export interface AvailableProvidersDescription {
  name: string;
  urlName: string;
  icon: string;
  color: string;
}