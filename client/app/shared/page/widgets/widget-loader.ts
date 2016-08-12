import {Page}                                  from '../page'
import {Widget, WidgetHost}                    from '../hierarchy'

import {WidgetBase, WidgetDescription}         from './widget-base'

import {Button, ButtonDescription}             from './button'
import {Column, ColumnDescription}             from './column'
import {EmbeddedHtml, EmbeddedHtmlDescription} from './embedded-html'
import {Heading, HeadingDescription}           from './heading'
import {Input, InputDescription}               from './input'
import {Link, LinkDescription}                 from './link'
import {Paragraph, ParagraphDescription}       from './paragraph'
import {QueryTable, QueryTableDescription}     from './query-table'
import {Row, RowDescription}                   from './row'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription, parent : WidgetHost) : WidgetBase {
    switch (desc.type) {
    case "button":
        return new Button(desc as ButtonDescription, parent);
    case "column":
        return new Column(desc as ColumnDescription, parent);
    case "embedded-html":
        return new EmbeddedHtml(desc as EmbeddedHtmlDescription, parent);
    case "heading":
        return new Heading(desc as HeadingDescription, parent);
    case "input":
        return new Input(desc as InputDescription, parent);
    case "link":
        return new Link(desc as LinkDescription, parent);
    case "paragraph":
        return new Paragraph(desc as ParagraphDescription, parent);
    case "query-table":
        return new QueryTable(desc as QueryTableDescription, parent);
    case "row":
        return new Row(desc as RowDescription, parent);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
