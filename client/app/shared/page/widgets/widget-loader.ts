import {Widget, WidgetDescription}         from './widget'

import {Paragraph, ParagraphDescription}   from './paragraph'
import {Heading, HeadingDescription}       from './heading'
import {QueryTable, QueryTableDescription} from './query-table'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription) : Widget {
    switch (desc.type) {
    case "paragraph":
        return new Paragraph(<ParagraphDescription> desc);
    case "heading":
        return new Heading(<HeadingDescription> desc);
    case "query-table":
        return new QueryTable(<QueryTableDescription> desc);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
