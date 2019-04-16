export interface AdminNewsDescription {
  id: string;
  title: {[key: string]: string};
  text: {[key: string]: string};
  publish_from: string;
  created_at: string;
  updated_at: string;
}

export interface UserNewsDescription {
  id: string;
  title: {[key: string]: string};
  text: {[key: string]: string};
  publish_from: string;
}

