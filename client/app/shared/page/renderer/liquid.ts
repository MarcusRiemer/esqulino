import {Type}                  from '@angular/core'

import {Page}                  from '../page'

import {Renderer}              from '../renderer'
import {
    WidgetBase, Row, Column,
    Button, EmbeddedHtml, Heading, Input, Link, Paragraph, QueryTable
} from '../widgets/index'

export {Renderer}

/**
 * A render function takes a widget and turns it into
 * a string. As it might need to render additional children it is
 * passed a function that renders arbitrary widgets itself.
 */
type WidgetRenderer = (w: WidgetBase, renderWidget : WidgetRenderer) => string;

/**
 * Render a single column with all children.
 */
function renderColumn(w: WidgetBase, renderWidget : WidgetRenderer) : string {
    const col = w as Column;
    const children : string = col.children
        .map(w => renderWidget(w, renderWidget))
        .join("");

    return (`<div class="${col.columnClasses}">${children}</div>`);
}

/**
 * Render a single row with all children
 */
function renderRow(w: WidgetBase, renderWidget : WidgetRenderer) : string {
    const row = w as Row;
    const children : string = row.children
        .map(c => renderWidget(c, renderWidget))
        .join("");
    return `<div class="row">${children}</div>`
}

/**
 * Directly renders a heading without rendering the form context. Action
 * and method are directly set via HTML5s `formaction` and `formmethod`.
 */
function renderButton(w: WidgetBase) : string {
    const button = w as Button;
    const text = button.text;
    const cssClass = "btn btn-secondary btn-block";

    const actionUrl = button.action.url;
    const method = button.action.method;

    return (`<button type="submit" formaction="${actionUrl}" formmethod="${method}" class="${cssClass}">${text}</button>`);    
}

/**
 * Renders raw HTML content, but encloses it in a comment to ease debugging
 * in case something goes wrong.
 */
function renderHtml(w: WidgetBase) : string {
    const embedded = w as EmbeddedHtml;

    return (`<!-- Raw HTML begin -->${embedded.html}<!-- Raw HTML end -->`);    
}

/**
 * Directly renders a heading.
 */
function renderHeading(w: WidgetBase) : string {
    const heading = <Heading> w;
    const tagname = `h${heading.level}`;
    return (`<${tagname}>${heading.text}</${tagname}>`);
}

/**
 * Renders a <input> element by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderInput(w: WidgetBase) : string {
    const input = w as Input;
    const outParamName = `outParamName: "${input.outParamName}"`;
    const caption = `caption: "${input.caption}"`
    const description = `description: "${input.description}"`
    const inputType = `inputType: "${input.inputType}"`
    
    return (`{% include "input" ${caption}, ${outParamName}, ${description}, ${inputType}  %}`);
}

function renderLink(w: WidgetBase) : string {
    const link = w as Link;
    const action = link.action;

    // Default URL does nothing
    let url = "#";
    
    if (action.isExternal) {
        // External URLs are simple to come by
        url = action.externalUrl;
    } else if (action.isInternal) {
        // Encode parameters as "key=value" pairs and join them with a "&"
        let queryString = action.internalParameters
            .map(p => `${p.parameterName}={{${p.providingName}}}`)
            .join("&");

        // If there were any parameters prepend the `?` to mark the beginning
        // of the query part of the URL
        if (queryString.length > 0) {
            queryString = "?" + queryString;
        }

        // We currently link to pages, not internal IDs
        const pageName = action.internalTargetPage.name;
        url = `/${pageName}${queryString}`
    }

    return (`<a href="${url}">${link.text}</a>`);
}

/**
 * Directly renders a paragraph.
 */
function renderParagraph(w: WidgetBase) : string {
    const paragraph = <Paragraph> w;
    return (`<p>${paragraph.text}</p>`);
}

/**
 * Renders a query table by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderQueryTable(w: WidgetBase) : string {
    const queryTable = <QueryTable> w;
    const queryName = queryTable.queryReferenceName;
    const columns = queryTable.columnNames.join(",");
    return (`{% include "query_table" table: query.${queryName}, columns: "${columns}" %}`);
}

/**
 * Generates sources that can be rendered via anything that
 * understands how to render liquid and knows the correct
 * context.
 */
export class LiquidRenderer extends Renderer {
    private static PAGE_HEADER = `
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <link rel="stylesheet" href="/vendor/css/bootstrap.css">
  </head>
  <body>
    <div class="container-fluid">
      <form>
`
    private static PAGE_FOOTER = `
      </form>
    </div>
  </body>
</html>
`
    constructor() {
        super("liquid");
    }
    
    
    /**
     * All known renderers for widgets
     */
    private _widgetRenderers : { [widgetType : string]: WidgetRenderer} = {
        "button" : renderButton,
        "column" : renderColumn,
        "embedded-html" : renderHtml,
        "query-table" : renderQueryTable,
        "paragraph" : renderParagraph,
        "heading" : renderHeading,
        "input" : renderInput,
        "link" : renderLink,
        "row" : renderRow,
    };
    
    /**
     * Renders a single widget
     */
    renderWidget(wid : WidgetBase) : string {
        const renderer = this._widgetRenderers[wid.type];
        if (!renderer) {
            throw new Error(`No LiquidRenderer for ${wid.type}`);
        } else {
            return (renderer(wid, (w) => this.renderWidget(w) ));
        }        
    }

    /**
     * Render the body of a whole page.
     */
    renderBody(rows : WidgetBase[]) : string {
        return (rows
                .map(r => this.renderWidget(r))
                .join(""));
    }
    
    
    protected renderImpl(page : Page) : string {
        const body = this.renderBody(page.children);
        return (`${LiquidRenderer.PAGE_HEADER}\n` +
                `${body}\n` +
                `${LiquidRenderer.PAGE_FOOTER}\n`);
    }
}
