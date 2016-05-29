import {Widget}                from './widget'
import {
    WidgetDescription, ParagraphDescription
} from '../page.description'

import {Paragraph}             from './paragraph'


function loadWidget(desc : WidgetDescription) : Widget {
    switch (desc.type) {
    case "paragraph":
        return new Paragraph(<ParagraphDescription> desc);
    default:
        throw new Error(`Unknown widget type "${desc.type}"`);
    }
}

export {
    Widget, Paragraph, loadWidget
}
