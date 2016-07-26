import {Page}                              from '../page'

import {Widget, WidgetDescription}         from './widget'

import {Button, ButtonDescription}         from './button'
import {Paragraph, ParagraphDescription}   from './paragraph'
import {Heading, HeadingDescription}       from './heading'
import {QueryTable, QueryTableDescription} from './query-table'
import {Input, InputDescription}           from './input'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription, page? : Page) : Widget {
    switch (desc.type) {
    case "button":
        return new Button(desc as ButtonDescription, page);
    case "paragraph":
        return new Paragraph(desc as ParagraphDescription, page);
    case "heading":
        return new Heading(desc as HeadingDescription, page);
    case "query-table":
        return new QueryTable(desc as QueryTableDescription, page);
    case "input":
        return new Input(desc as InputDescription, page);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
