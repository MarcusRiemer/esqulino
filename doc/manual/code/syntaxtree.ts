export interface NodeDescription {
  name: string
  language: string
  children?: {
    [childrenCategory: string]: NodeDescription[];
  }
  properties?: {
    [propertyName: string]: string;
  }
}
