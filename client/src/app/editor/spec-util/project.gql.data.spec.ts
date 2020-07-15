import { generateUUIDv4 } from "../../shared/util-browser";
import {AdminListProjectsQuery, Project} from "../../../generated/graphql";

type ProjectGQLResponse = { data: (AdminListProjectsQuery)};
type AdminListProjectNode = AdminListProjectsQuery["projects"]["nodes"][0]

const ADMIN_LIST_PROJECT: AdminListProjectNode = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: { en: "Project" },
  codeResourceCount: 0
};


const wrapProjectData = (
  data:AdminListProjectNode[]
): ProjectGQLResponse => {
  return {
    data: {
      projects: {
        nodes: data,
        totalCount: data.length,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "NQ",
          endCursor: "NQ"
        }
      }
    }
  }
};

/**
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleProjectResponse = (
  override?: AdminListProjectNode
): ProjectGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  const projects:AdminListProjectNode[] = [];
  projects.push(Object.assign({}, ADMIN_LIST_PROJECT, override || {}, { id }));
  return wrapProjectData(projects);
};

/**
 * Generates an empty project response
 */
export const buildEmptyProjectResponse = (): ProjectGQLResponse => {
  return wrapProjectData([]);
};


