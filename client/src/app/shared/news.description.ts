import { MultilingualString } from './multilingual-string.description';


export interface AdminNewsDescription {
  id: string;
  title: MultilingualString;
  text: MultilingualString;
  publishedFrom: string;
  createdAt: string;
  updatedAt: string;
}


export interface UserNewsDescription {
  id: string;
  title: MultilingualString;
  text: MultilingualString;
  publishedFrom: string;
}

