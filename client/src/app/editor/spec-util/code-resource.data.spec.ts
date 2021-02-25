import { MetaCodeResourceListDescription } from "../../admin/grammar/meta-code-resource.description";
import { generateUUIDv4 } from "../../shared/util-browser";

/**
 * Generates a valid MetaCodeResourceListDescription. Be aware the
 */
export const buildMetaCodeResourceListItem = (
  override?: Partial<MetaCodeResourceListDescription>
): MetaCodeResourceListDescription => {
  return Object.assign(
    {},
    {
      name: "Empty Meta Code Resource",
      project: {
        name: {
          de: "deutsch",
          en: "english",
        },
      },
    },
    override || {},
    { id: generateUUIDv4() }
  );
};
