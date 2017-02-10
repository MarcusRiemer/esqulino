import {
    ProjectResourceDescription, CURRENT_API_VERSION
} from '../resource.description'

export {CURRENT_API_VERSION}

/**
 * Inputs and outputs *may* use identical names but are not required
 * to do so.
 */
export interface ParameterMappingDescription {
    parameterName : string

    providingName? : string
}

/**
 * Actions specify the intent, usually along with some parameters.
 */
export interface ActionDescription {
    // Discriminator value for inheritance
    type : string
}

/**
 * This action takes the user to a different page. This different page may
 * be part of the same project (in this case we know which parameters are
 * required) or somewhere else.
 *
 * The `internal` and `external` property may NOT be set both on the same
 * description.
 */
export interface NavigateActionDescription extends ActionDescription {
    type : "navigate"

    // If this link targets an internal page, this describes the page
    // we want to go to.
    internal? : {
        pageId : string
        parameters : ParameterMappingDescription[];
    }

    // If this link targets an external page we don't make any
    // addtional assumptions.
    external? : string
}

/**
 * Describes a input widget. These are usually text-orientated.
 */
export interface InputDescription extends WidgetDescription {
    type : "input"

    // The <input> "type" attribute. Do note that <input type="hidden">
    // is modelled with a distinct type, because it does not share many
    // properties with the kind of input we are talking about here.
    inputType : string

    // The <label> for this input
    caption : string

    // A description text for the end-user
    description : string

    // The parameter this widget provides
    outParamName : string

    // Is it mandatory to fill in this field?
    required? : boolean
}

/**
 * Describes a hidden <input> element, that can be used to pass
 * on some kind of serverside state.
 */
export interface HiddenInputDescription extends WidgetDescription {
    type : "hidden"

    // The parameter this widget provides
    outParamName : string

    // The value this field provides
    value : string;
}

/**
 * Describes a <select> element with its <option>-nodes.
 */
export interface SelectDescription extends WidgetDescription {
    type : "select"
    
    // The <label> for this input
    caption : string

    // The parameter this widget provides
    outParamName : string

    // The query that is used to generate the <options>
    queryRefName? : string

    // Called for every <option> to determine its value 
    optionValueExpression? : string

    // Called for every <option> to determine its text 
    optionTextExpression? : string
}

/**
 * Describes a button the user can press to execute some query or
 * plugin action.
 */
export interface ButtonDescription extends WidgetDescription {
    type : "button"

    // The text on the button
    text : string

    // What query should be executed if the user presses the button?
    query? : QueryReferenceDescription

    // What page should be navigated to if the user presses the button?
    navigate? : NavigateActionDescription
}

/**
 * Describes a HTML form
 */
export interface FormDescription extends WidgetDescription {
    type : "form"

    children : WidgetDescription[]
}

/**
 * Describes another page the user would possibly like to navigate to.
 */
export interface LinkDescription extends WidgetDescription {
    type : "link"

    // The text on the link
    text : string

    // The action to perform
    action : NavigateActionDescription
}

/**
 * Describes a table that shows the results of a query.
 */
export interface QueryTableDescription {
    type: "query-table"
    queryRefName? : string
    columns : string[]
}

/**
 * Describes a heading widget.
 */
export interface HeadingDescription extends WidgetDescription {
    type : "heading"
    text : string
    level : number
}

/**
 * Describes a paragraph widget.
 */
export interface ParagraphDescription extends WidgetDescription {
    type : "paragraph"
    text : string
}

/*
 * Experienced users can embed raw HTML into pages. This widget
 * (currently) does absolutly *no checking* whether the given
 * html is valid or not.
 */
export interface EmbeddedHtmlDescription extends WidgetDescription {
    type : "embedded-html",
    html : string
}

/**
 * Describes a column that can host certain widgets
 */
export interface ColumnDescription extends WidgetDescription {
    type : "column"
    width : number
    widgets : WidgetDescription[]
}

/**
 * Describes a row that can host certain cells.
 */
export interface RowDescription extends WidgetDescription {
    type : "row"
    columns : ColumnDescription[]
}

/**
 * The body of an HTML page, will only appear once in a page.
 */
export interface BodyDescription extends WidgetDescription {
    type : "body"
    children : WidgetDescription[]
}

/**
 * A widget **requires** at least a type, all other fields are
 * mandated by deriving descriptions. As we don't necesarily
 * know all deriving classes at compile time (they could be
 * provided by a plugin) we poke a hole in the type system
 * here.
 *
 * The following annotion is required to allow additional
 * properties in the automatically generated JSON schema, see
 * https://github.com/YousefED/typescript-json-schema/issues/44
 *
 * @TJS-additionalProperties true
 */
export interface WidgetDescription {
    // Discriminator value
    type : string
    [additional: string]: any
}

/**
 * A single or repeating value of any origin, as long as it's
 * referenceable by a variable name.
 *
 * @TJS-additionalProperties true
 */
export interface ValueReferenceDescription {
    // Discriminator value
    type : "column" | "query"
}

/**
 * Can be used to denote a column of a row. This description is completly
 * agnostic of the query it references.
 */
export interface ColumnReferenceDescription extends ValueReferenceDescription {
    type : "column"

    // The query variable this column references
    variableName : string

    // The name of the column
    columnName : string
}

/**
 * Referenced queries are possibly accompanied by a human-readable
 * name. This is required if the same query is going to be used
 * multiple times on a single page.
 */
export interface QueryReferenceDescription extends ValueReferenceDescription {
    type : "query" 

    // The id of the query this reference points to
    queryId? : string

    // The user-defined name of the reference. If no name is given, the
    // name should be the same as the name of the referenced query.
    name? : string

    // Which values should serve as parameters for this query?
    mapping? : ParameterMappingDescription[]
}

/**
 * A parameter that is required to render a page.
 */
export interface PageParameterDescription {
    name : string
}

/**
 * Describes a page as a whole
 */
export interface PageDescription extends ProjectResourceDescription {
    /**
     * The host for all widgets that are part of this page.
     */
    body? : BodyDescription

    /**
     * IDs of queries that are referenced in this page. Only
     * these queries provide additional DB information that can
     * be used on this page.
     */
    referencedQueries? : QueryReferenceDescription[]

    /**
     * All parameters that are required to render this page. These
     * are usually satisfied via GET parameters
     */
    parameters? : PageParameterDescription[]
}
