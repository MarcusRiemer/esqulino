import {
  ApiVersion,
  ApiVersionToken,
  CURRENT_API_VERSION,
} from "./resource.description";

export { ApiVersion, ApiVersionToken, CURRENT_API_VERSION };

export interface ImageMetadataDescription extends ApiVersion {
  uuid: string;
  author: string;
  authorurl: string;
  license: string;
  //licenseurl: string
  filepath: string;
}
