import {
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    ParameterMappingDescription
} from '../page.description'
import {
    isWidget, isWidgetHost, Widget, WidgetHost, WidgetCategory
} from '../hierarchy'


import {Action, NavigateAction, QueryAction}   from './action'

import {WidgetBase, WidgetDescription}         from './widget-base'
import {loadWidget}                            from './widget-loader'

import {Row, RowDescription}                   from './row'
import {Column, ColumnDescription}             from './column'

import {Body, BodyDescription}                 from './body'
import {Button, ButtonDescription}             from './button'
import {EmbeddedHtml, EmbeddedHtmlDescription} from './embedded-html'
import {Form, FormDescription}                 from './form'
import {Heading, HeadingDescription}           from './heading'
import {HiddenInput, HiddenInputDescription}   from './hidden-input'
import {Input, InputDescription}               from './input'
import {Link, LinkDescription}                 from './link'
import {Paragraph, ParagraphDescription}       from './paragraph'
import {QueryTable, QueryTableDescription}     from './query-table'
import {Select, SelectDescription}             from './select'

export {
    WidgetBase, WidgetDescription, WidgetCategory,
    WidgetHost, Widget, isWidgetHost, isWidget,
    Row, RowDescription,
    Column, ColumnDescription,
    ParameterMappingDescription,
    Body, BodyDescription,
    Button, ButtonDescription,
    EmbeddedHtml, EmbeddedHtmlDescription,
    Form, FormDescription,
    Paragraph, ParagraphDescription,
    Heading, HeadingDescription,
    HiddenInput, HiddenInputDescription,
    QueryTable, QueryTableDescription,
    Select, SelectDescription,
    Input, InputDescription,
    Link, LinkDescription,

    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    Action, NavigateAction, QueryAction,
    
    loadWidget
}
