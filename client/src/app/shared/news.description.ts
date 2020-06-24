import { MultiLangString } from "./multilingual-string.description";

/**
 * News as it is displayed on the frontpage. The text may or may not
 * be shortened from the full version.
 */
export interface NewsFrontpageDescription {
  id: string;
  title: MultiLangString;
  /** Rendered HTML version of the text */
  text: MultiLangString;
  publishedFrom: string;
}

/**
 * Complete description of a news that may not have been published.
 */
export interface NewsDescription {
  id: string;
  title: MultiLangString;
  /** Internal Markdown version of the text */
  text: MultiLangString;
  publishedFrom: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

/**
 * Data that needs to be sent when updating a news. The variant using
 * Pick<> doesn't seem to be properly supported by the JSON schema generator.
 *
 * See: https://github.com/vega/ts-json-schema-generator/pull/96
 */
// export type NewsUpdateDescription = Pick<NewsDescription, "title" | "text" | "publishedFrom">;
export interface NewsUpdateDescription {
  title: MultiLangString;
  /** Internal Markdown version of the text */
  text: MultiLangString;
  publishedFrom: string | null;
  userId?: string;
}
