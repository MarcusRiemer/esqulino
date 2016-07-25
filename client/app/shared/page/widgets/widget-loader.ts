import {Widget, WidgetDescription}         from './widget'

import {Paragraph, ParagraphDescription}   from './paragraph'
import {Heading, HeadingDescription}       from './heading'
import {QueryTable, QueryTableDescription} from './query-table'
import {Input, InputDescription}           from './input'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription) : Widget {
    switch (desc.type) {
    case "paragraph":
        return new Paragraph(desc as ParagraphDescription);
    case "heading":
        return new Heading(desc as HeadingDescription);
    case "query-table":
        return new QueryTable(desc as QueryTableDescription);
    case "input":
        return new Input(desc as InputDescription);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
