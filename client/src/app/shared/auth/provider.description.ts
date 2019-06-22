export interface ServerProviderDescription {
  providers: Provider[];
  primary: string;
}
export interface Provider {
  uid: string;
  type: string;
  data: ProviderData;
}

export interface ProviderData {
  confirmed: boolean;
  link: string;
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