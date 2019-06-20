
export interface ServerProviderDescription {
  extern: ExternProviderDescription[];
  intern: InternProviderDescription[];
  primary: string;
}

export interface ExternProviderDescription {
  provider: string;
}

export interface InternProviderDescription {
  uid: string;
  provider: string;
  confirmed: boolean;
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