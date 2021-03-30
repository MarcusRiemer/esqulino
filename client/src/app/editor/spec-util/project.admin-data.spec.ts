import { generateUUIDv4 } from "../../shared/util-browser";
import {
  AdminListProjectsQuery,
  FrontpageListProjectsQuery,
} from "../../../generated/graphql";

export type AdminProjectGQLResponse = { data: AdminListProjectsQuery };
type AdminListProjectNode = AdminListProjectsQuery["projects"]["nodes"][0];

export type FrontendProjectGQLResponse = { data: FrontpageListProjectsQuery };
type FrontendListProjectNode = FrontpageListProjectsQuery["projects"]["nodes"][0];

const ADMIN_LIST_PROJECT: AdminListProjectNode = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: { en: "Project" },
  codeResourceCount: 0,
  user: {
    displayName: "System",
  },
};

const FRONTEND_LIST_PROJECT: FrontendListProjectNode = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: { en: "Project" },
  public: true,
  description: { en: "Project" },
  preview: "Project",
  indexPageId: "352150eb-88bf-451b-821e-9fed8ce02cc2",
  createdAt: "2018-02-20T20:48:21Z",
  updatedAt: "2020-05-29T17:52:50Z",
  userId: "00000000-0000-0000-0000-000000000000",
  blockLanguages: [
    {
      defaultProgrammingLanguage: {
        id: "truck-lang",
        name: "Trucklino Lang",
      },
    },
  ],
};

const wrapAdminProjectData = (
  data: AdminListProjectNode[]
): AdminProjectGQLResponse => {
  return {
    data: {
      projects: {
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

const wrapFrontendProjectData = (
  data: FrontendListProjectNode[]
): FrontendProjectGQLResponse => {
  return {
    data: {
      projects: {
        nodes: data,
      },
    },
  };
};

/**
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildFrontendProjectResponse = (
  override?: FrontendListProjectNode
): FrontendProjectGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  const projects: FrontendListProjectNode[] = [];
  projects.push(
    Object.assign({}, FRONTEND_LIST_PROJECT, override || {}, { id })
  );
  return wrapFrontendProjectData(projects);
};

/**
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleProjectResponse = (
  override?: AdminListProjectNode
): AdminProjectGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  const projects: AdminListProjectNode[] = [];
  projects.push(Object.assign({}, ADMIN_LIST_PROJECT, override || {}, { id }));
  return wrapAdminProjectData(projects);
};

/**
 * Generates an empty project response
 */
export const buildEmptyProjectResponse = (): AdminProjectGQLResponse => {
  return wrapAdminProjectData([]);
};
