import {Widget, WidgetDescription}       from './widget'

import {Paragraph, ParagraphDescription} from './paragraph'

/**
 * @return A Widget instance that matches the description
 */
export function loadWidget(desc : WidgetDescription) : Widget {
    switch (desc.type) {
    case "paragraph":
        return new Paragraph(<ParagraphDescription> desc);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}
