import {Type}                  from '@angular/core'

import {Page}                  from '../page'

import {Renderer}              from '../renderer'
import {
    Widget, Row, Column,
    Button, Paragraph, Heading, QueryTable, Input
} from '../widgets/index'

export {Renderer}

type WidgetRenderer = (w: Widget) => string;

function renderQueryTable(w: Widget) : string {
    const queryTable = <QueryTable> w;
    const queryName = queryTable.queryReferenceName;
    const columns = queryTable.columnNames.join(",");
    return (`{% include "query_table" table: query.${queryName}, columns: "${columns}" %}`);
}


function renderParagraph(w: Widget) : string {
    const paragraph = <Paragraph> w;
    return (`<p>${paragraph.text}</p>`);
}

function renderHeading(w: Widget) : string {
    const heading = <Heading> w;
    const tagname = `h${heading.level}`;
    return (`<${tagname}>${heading.text}</${tagname}>`);
}

function renderInput(w: Widget) : string {
    const input = w as Input;
    const outParamName = `outParamName: "${input.outParamName}"`;
    const caption = `caption: "${input.caption}"`
    const description = `description: "${input.description}"`
    const inputType = `inputType: "${input.inputType}"`
    
    return (`{% include "input" ${caption}, ${outParamName}, ${description}, ${inputType}  %}`);
}

function renderButton(w: Widget) : string {
    const button = w as Button;
    const text = button.text;

    return (`<button type="button" class="btn btn-secondary btn-block">${text}</button>`);    
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
