import {Type}                  from '@angular/core'

import {Page}                  from '../page'

import {Renderer}              from '../renderer'
import {
    Widget, Row, Column,
    Button, EmbeddedHtml, Paragraph, Heading, QueryTable, Input
} from '../widgets/index'

export {Renderer}

type WidgetRenderer = (w: Widget) => string;

/**
 * Renders a query table by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderQueryTable(w: Widget) : string {
    const queryTable = <QueryTable> w;
    const queryName = queryTable.queryReferenceName;
    const columns = queryTable.columnNames.join(",");
    return (`{% include "query_table" table: query.${queryName}, columns: "${columns}" %}`);
}


/**
 * Directly renders a paragraph.
 */
function renderParagraph(w: Widget) : string {
    const paragraph = <Paragraph> w;
    return (`<p>${paragraph.text}</p>`);
}

/**
 * Directly renders a heading.
 */
function renderHeading(w: Widget) : string {
    const heading = <Heading> w;
    const tagname = `h${heading.level}`;
    return (`<${tagname}>${heading.text}</${tagname}>`);
}

/**
 * Renders a <input> element by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderInput(w: Widget) : string {
    const input = w as Input;
    const outParamName = `outParamName: "${input.outParamName}"`;
    const caption = `caption: "${input.caption}"`
    const description = `description: "${input.description}"`
    const inputType = `inputType: "${input.inputType}"`
    
    return (`{% include "input" ${caption}, ${outParamName}, ${description}, ${inputType}  %}`);
}

/**
 * Directly renders a heading without rendering the form context. Action
 * and method are directly set via HTML5s `formaction` and `formmethod`.
 */
function renderButton(w: Widget) : string {
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
function renderHtml(w: Widget) : string {
    const embedded = w as EmbeddedHtml;

    return (`<!-- Raw HTML begin -->${embedded.html}<!-- Raw HTML end -->`);    
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
        "embedded-html" : renderHtml,
        "query-table" : renderQueryTable,
        "paragraph" : renderParagraph,
        "heading" : renderHeading,
        "input" : renderInput
    };
    
    /**
     * Renders a single widget
     */
    renderWidget(wid : Widget) : string {
        const renderer = this._widgetRenderers[wid.type];
        if (!renderer) {
            throw new Error(`No LiquidRenderer for ${wid.type}`);
        } else {
            return (renderer(wid));
        }        
    }
    
    /**
     * Render a single column
     */
    renderColumn(col : Column) : string {
        const children : string = col.widgets
            .map(w => this.renderWidget(w))
            .join("");

        return (`<div class="${col.columnClasses}">${children}</div>`);
    }

    /**
     * Render a single row
     */
    renderRow(row : Row) : string {
        const children : string = row.columns
            .map(c => this.renderColumn(c))
            .join("");
        return `<div class="row">${children}</div>`
    }

    /**
     * Render the body of a whole page.
     */
    renderBody(rows : Row[]) : string {
        return (rows
                .map(r => this.renderRow(r))
                .join(""));
    }
    
    
    protected renderImpl(page : Page) : string {
        const body = this.renderBody(page.rows);
        return (`${LiquidRenderer.PAGE_HEADER}\n` +
                `${body}\n` +
                `${LiquidRenderer.PAGE_FOOTER}\n`);
    }
}
