import {Type}                  from '@angular/core'

import {Page}                  from '../page'

import {Renderer}              from '../renderer'
import {
    Widget, Row, Column,
    Body, Button, EmbeddedHtml, Form, Heading,
    HiddenInput, Input, Link, Paragraph,
    QueryTable, Select
} from '../widgets/index'

export {Renderer}

/**
 * A render function takes a widget and turns it into
 * a string. As it might need to render additional children it is
 * passed a function that renders arbitrary widgets itself.
 */
type WidgetRenderer = (w: Widget, renderWidget : WidgetRenderer) => string;

function renderBody(w: Widget, renderWidget : WidgetRenderer) : string {
    const body = w as Body;
    const children : string = body.children
        .map(child => renderWidget(child, renderWidget))
        .join("\n");

    return (`
<body>
  <div class="container-fluid">
    ${children}
  </div>
  {% include "edit-ribbon" %}
</body>
`);
}

/**
 * Render a single column with all children.
 */
function renderColumn(w: Widget, renderWidget : WidgetRenderer) : string {
    const col = w as Column;
    const children : string = col.children
        .map(w => renderWidget(w, renderWidget))
        .join("\n");

    return (`<div class="${col.columnClasses}">${children}</div>`);
}

/**
 * Render a single row with all children
 */
function renderRow(w: Widget, renderWidget : WidgetRenderer) : string {
    const row = w as Row;
    const children : string = row.children
        .map(c => renderWidget(c, renderWidget))
        .join("\n");
    return `<div class="row">${children}</div>`
}

/**
 * Render a form
 */
function renderForm(w: Widget, renderWidget : WidgetRenderer) : string {
    const form = w as Form;
    const children : string = form.children
        .map(c => renderWidget(c, renderWidget))
        .join("\n");
    
    return `<form>${children}</form>`
}

/**
 * Directly renders a heading without rendering the form context. Action
 * and method are directly set via HTML5s `formaction` and `formmethod`.
 */
function renderButton(w: Widget) : string {
    const button = w as Button;
    const text = button.text;
    const cssClass = "btn btn-secondary btn-block";

    // What type of button should be rendered?
    if (button.queryReference && button.queryReference.isResolveable) {
        // A button that refers to a query
        const pageName = w.page.name;
        const queryId = button.queryReference.query.id;
        const actionUrl = `/${pageName}/query/${queryId}`;

        const mapping = button.mapping
            .filter(m => m.providingName && m.parameterName != m.providingName)
            .map(m => `${m.parameterName}=${m.providingName}`)
            .join("&")

        const encodedUrl = actionUrl + "?" + mapping
        const method = "POST";

        return (`<button type="submit" formaction="${encodedUrl}" formmethod="${method}" class="${cssClass}">${text}</button>`);
    } else if (button.navigateAction.hasAnyTarget) {
        // A button that refers to a different page
        const encodedUrl = button.navigateAction.targetUrl;
        const method = button.navigateAction.method;
        
        return (`<button type="submit" formaction="${encodedUrl}" formmethod="${method}"class="${cssClass}">${text}</button>`);
    } else {
        // An error, because the button has no valid target
        return (`<div class="alert alert-danger" role="alert">Dieser Knopf hat kein gültiges Ziel und wird daher nicht dargestellt!</div>`);
    }
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
 * Directly renders a heading.
 */
function renderHeading(w: Widget) : string {
    const heading = w as Heading;
    const tagname = `h${heading.level}`;
    return (`<${tagname}>${heading.text}</${tagname}>`);
}

function renderHidden(w: Widget) : string {
    const h = w as HiddenInput;
    return (`<input type="hidden" name="${h.outParamName}" value="${h.value}">`);
}

/**
 * Renders a <input> element by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderInput(w: Widget) : string {
    const input = w as Input;
    const outParamName = `outParamName: "${input.outParamName}"`;
    const caption = `caption: "${input.caption}"`;
    const description = `description: "${input.description}"`;
    const inputType = `inputType: "${input.inputType}"`;
    const required = `required: ${input.required}`;
    const initialValue = `initialValue: ${input.initialValue}`;
    
    return (`{% include "input" ${caption}, ${outParamName}, ${description}, ${inputType}, ${required}  , ${initialValue} %}`);
}

function renderLink(w: Widget) : string {
    const link = w as Link;
    const url = link.action.targetUrl;

    return (`<a href="${url}">${link.text}</a>`);
}

/**
 * Directly renders a paragraph.
 */
function renderParagraph(w: Widget) : string {
    const paragraph = w as Paragraph;
    return (`<p>${paragraph.text}</p>`);
}

/**
 * Renders a query table by including the releveant template and
 * passing the correct parameters to it. This rendering step therefore
 * relies on data on the server!
 */
function renderQueryTable(w: Widget) : string {
    const queryTable = w as QueryTable;
    const queryName = queryTable.queryReferenceName;
    const columns = queryTable.columnNames.join(",");
    return (`{% include "query_table" table: query.${queryName}, columns: "${columns}" %}`);
}

function renderSelect(w: Widget) : string {
    const select = w as Select;
    const queryName = select.queryReferenceName;
    const options = `options: query.${queryName}`;
    const outParamName = `outParamName: "${select.outParamName}"`;
    const caption = `caption: "${select.caption}"`;
    const optionTextExpr = `optionText: "${select.optionTextExpression}"`;
    const optionValueExpr = `optionValue: "${select.optionValueExpression}"`;

    return (`<fieldset class="form-group">
  <label for="input-${select.outParamName}">
    ${select.caption}
  </label>
  <select class="form-control"
          id="input-${select.outParamName}$"
          name="${select.outParamName}">
    {% for option in query.${queryName} %}
      <option value="{{ option['${select.optionValueExpression}'] }}">
        {{ option['${select.optionTextExpression}'] }}
      </option>
    {% endfor %}
  </select>
</fieldset>`);
}

/**
 * Generates sources that can be rendered via anything that
 * understands how to render liquid and knows the correct
 * context.
 */
export class LiquidRenderer extends Renderer {
    private static PAGE_HEADER = `<!DOCTYPE html>
<html>
  <head>
    <title>{{ page.name }} - {{ project.name }}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <link rel="stylesheet" href="/vendor/css/bootstrap.css">
    <link rel="stylesheet" href="/vendor/css/esqulino-ribbon.css">
  </head>`
    private static PAGE_FOOTER = `
</html>
`
    constructor() {
        super("liquid");
    }
    
    
    /**
     * All known renderers for widgets
     */
    private _widgetRenderers : { [widgetType : string]: WidgetRenderer} = {
        "body" : renderBody,
        "button" : renderButton,
        "column" : renderColumn,
        "embedded-html" : renderHtml,
        "form": renderForm,
        "query-table" : renderQueryTable,
        "paragraph" : renderParagraph,
        "heading" : renderHeading,
        "hidden" : renderHidden,
        "input" : renderInput,
        "link" : renderLink,
        "row" : renderRow,
        "select": renderSelect,
    };
    
    /**
     * Renders a single widget
     */
    renderWidget(wid : Widget) : string {
        const renderer = this._widgetRenderers[wid.type];
        if (!renderer) {
            throw new Error(`No LiquidRenderer for ${wid.type}`);
        } else {
            return (renderer(wid, (w) => this.renderWidget(w) ));
        }        
    }
    
    protected renderImpl(page : Page) : string {
        const body = this.renderWidget(page.body);
        return (`${LiquidRenderer.PAGE_HEADER}\n` +
                `${body}\n` +
                `${LiquidRenderer.PAGE_FOOTER}\n`);
    }
}
