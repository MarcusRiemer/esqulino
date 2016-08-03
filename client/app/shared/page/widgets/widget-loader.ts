import {Page}                                  from '../page'

import {Widget, WidgetDescription}             from './widget'

import {Button, ButtonDescription}             from './button'
import {EmbeddedHtml, EmbeddedHtmlDescription} from './embedded-html'
import {Heading, HeadingDescription}           from './heading'
import {Input, InputDescription}               from './input'
import {Link, LinkDescription}                 from './link'
import {Paragraph, ParagraphDescription}       from './paragraph'
import {QueryTable, QueryTableDescription}     from './query-table'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription, page? : Page) : Widget {
    switch (desc.type) {
    case "button":
        return new Button(desc as ButtonDescription, page);
    case "embedded-html":
        return new EmbeddedHtml(desc as EmbeddedHtmlDescription, page);
    case "heading":
        return new Heading(desc as HeadingDescription, page);
    case "input":
        return new Input(desc as InputDescription, page);
    case "link":
        return new Link(desc as LinkDescription, page);
    case "paragraph":
        return new Paragraph(desc as ParagraphDescription, page);
    case "query-table":
        return new QueryTable(desc as QueryTableDescription, page);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
