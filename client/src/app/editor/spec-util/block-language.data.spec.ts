import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { BlockLanguageDescription } from "../../shared/block/block-language.description";
import { generateUUIDv4 } from '../../shared/util-browser';
import { ServerApiService, IndividualBlockLanguageDataService } from '../../shared/serverdata';

const DEFAULT_EMPTY_BLOCKLANGUAGE = Object.freeze<BlockLanguageDescription>({
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Block Language",
  sidebars: [],
  editorBlocks: [],
  editorComponents: [],
  defaultProgrammingLanguageId: "spec"
});

/**
 * Generates a valid block language description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildBlockLanguage = (
  override?: Partial<BlockLanguageDescription>
): BlockLanguageDescription => {
  return (Object.assign({}, DEFAULT_EMPTY_BLOCKLANGUAGE, override || {}, { id: generateUUIDv4() }));
};

export const ensureLocalBlockLanguageRequest = (
  response: BlockLanguageDescription
) => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const serverApi = TestBed.inject(ServerApiService);
  const blockData = TestBed.inject(IndividualBlockLanguageDataService);

  const toReturn = blockData.getLocal(response.id, "request");

  httpTestingController.expectOne(serverApi.individualBlockLanguageUrl(response.id))
    .flush(response);

  return (toReturn);
}