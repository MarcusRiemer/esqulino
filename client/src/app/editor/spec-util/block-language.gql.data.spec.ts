import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import {
  BlockLanguageDescription,
  BlockLanguageListDescription,
} from "../../shared/block/block-language.description";
import { generateUUIDv4 } from "../../shared/util-browser";
import {
  ServerApiService,
  IndividualBlockLanguageDataService,
} from "../../shared/serverdata";
import { provideListResponse, ListOrder } from "./list.data.spec";
import {
  AdminListBlockLanguagesQuery,
  AdminListGrammarsQuery,
} from "../../../generated/graphql";

type BlockLanguageGQLResponse = { data: AdminListBlockLanguagesQuery };
type AdminListBlockLanguageNode = AdminListBlockLanguagesQuery["blockLanguages"]["nodes"][0];

const ADMIN_LIST_BLOCKLANGUAGE: AdminListBlockLanguageNode = {
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Block Language",
  slug: "BlockLanguage Slug",
  generated: true,
  grammarId: "96659508-e006-4290-926e-0734e7dd072b",
};

const wrapBlockLanguageData = (
  data: AdminListBlockLanguageNode[]
): BlockLanguageGQLResponse => {
  return {
    data: {
      blockLanguages: {
        nodes: data,
        totalCount: data.length,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "NQ",
          endCursor: "NQ",
        },
      },
    },
  };
};

/**
 * Generates a valid block language description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleBlockLanguageResponse = (
  override?: AdminListBlockLanguageNode
): BlockLanguageGQLResponse => {
  const blockLanguages: AdminListBlockLanguageNode[] = [];
  blockLanguages.push(
    Object.assign({}, ADMIN_LIST_BLOCKLANGUAGE, override || {}, {
      id: generateUUIDv4(),
    })
  );
  return wrapBlockLanguageData(blockLanguages);
};

/**
 * Generates an empty project response
 */
export const buildEmptyBlockLanguageResponse = (): BlockLanguageGQLResponse => {
  return wrapBlockLanguageData([]);
};
