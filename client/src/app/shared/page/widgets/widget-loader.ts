import {Page}                                  from '../page'
import {Widget, WidgetHost}                    from '../hierarchy'

import {WidgetBase, WidgetDescription}         from './widget-base'

import {Button, ButtonDescription}             from './button'
import {Column, ColumnDescription}             from './column'
import {EmbeddedHtml, EmbeddedHtmlDescription} from './embedded-html'
import {Form, FormDescription}                 from './form'
import {Heading, HeadingDescription}           from './heading'
import {HiddenInput, HiddenInputDescription}   from './hidden-input'
import {Input, InputDescription}               from './input'
import {Link, LinkDescription}                 from './link'
import {Paragraph, ParagraphDescription}       from './paragraph'
import {QueryTable, QueryTableDescription}     from './query-table'
import {Row, RowDescription}                   from './row'
import {Select, SelectDescription}             from './select'

/**
 * Factory function to instantiate the correct widget.
 */
function createWidget(desc : WidgetDescription, parent : WidgetHost) : WidgetBase {
    switch (desc.type) {
    case "button":
        return new Button(desc as ButtonDescription, parent);
    case "column":
        return new Column(desc as ColumnDescription, parent);
    case "embedded-html":
        return new EmbeddedHtml(desc as EmbeddedHtmlDescription, parent);
    case "form":
        return new Form(desc as FormDescription, parent);
    case "heading":
        return new Heading(desc as HeadingDescription, parent);
    case "hidden":
        return new HiddenInput(desc as HiddenInputDescription, parent);
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
    case "select":
        return new Select(desc as SelectDescription, parent);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}

/**
 * Loads a new widget in the context of an existing parent. In case there is not
 * only a parent but also a page available the `modelChanged` event is wired up
 * to mark the page for saving if the loaded widget changed.
 *
 * @return A Widget instance that matches the description.
 */
export function loadWidget(desc : WidgetDescription, parent : WidgetHost) : WidgetBase {
    const widget = createWidget(desc, parent);

    // If this widget has a page wire up changes that would require
    // saving the page.
    try {
        if (widget.page) {
            widget.modelChanged.subscribe(_ => widget.page.markSaveRequired());
        }
    } catch (e) {
        console.log("Loaded widget without page", widget);
    }

    return (widget);
}
