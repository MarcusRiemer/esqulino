import {
    WidgetDescription, ParagraphDescription
} from '../page.description'

import {Widget}                          from './widget'

import {Row, RowDescription}             from './row'
import {Column, ColumnDescription}       from './column'

import {Paragraph}                       from './paragraph'

/**
 * @return A Widget instance that matches the description
 */
function loadWidget(desc : WidgetDescription) : Widget {
    switch (desc.type) {
    case "paragraph":
        return new Paragraph(<ParagraphDescription> desc);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}

export {
    Widget, WidgetDescription,
    Row, RowDescription,
    Column, ColumnDescription,
    Paragraph, ParagraphDescription,
    loadWidget
}
