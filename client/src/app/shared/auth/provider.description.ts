
export interface ServerProviderDescription {
  providers: ProviderDescription[];
  primary: string;
}
export interface ProviderDescription {
  id: string;
  type: string;
  data: ProviderData;
}

export interface ProviderData {
  confirmed: boolean;
  link: string;
  email: string
}

export interface ChangePrimaryEmailDescription {
  primaryEmail: string;
}

export interface ClientProviderDescription {
  name: string;
  urlName: string;
  icon: string;
  color: string;
}