import { MultilingualString } from '../multilingual-string.description';


export interface AdminNewsDescription {
  id: string;
  title: MultilingualString;
  text: MultilingualString;
  published_from: string;
  created_at: string;
  updated_at: string;
}

export interface UserNewsDescription {
  id: string;
  title: MultilingualString;
  text: MultilingualString;
  published_from: string;
}

