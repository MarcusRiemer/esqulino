import {
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    ParameterMappingDescription
} from '../page.description'

import {Widget, WidgetDescription}         from './widget'
import {loadWidget}                        from './widget-loader'

import {Row, RowDescription}               from './row'
import {Column, ColumnDescription}         from './column'

import {
    QueryAction, 
    QueryActionDescription
} from './action'

import {Button, ButtonDescription}             from './button'
import {EmbeddedHtml, EmbeddedHtmlDescription} from './embedded-html'
import {Heading, HeadingDescription}           from './heading'
import {Input, InputDescription}               from './input'
import {Link, LinkDescription}                 from './link'
import {Paragraph, ParagraphDescription}       from './paragraph'
import {QueryTable, QueryTableDescription}     from './query-table'

export {
    Widget, WidgetDescription,
    Row, RowDescription,
    Column, ColumnDescription,
    QueryAction,
    QueryActionDescription, ParameterMappingDescription,
    Button, ButtonDescription,
    EmbeddedHtml, EmbeddedHtmlDescription,
    Paragraph, ParagraphDescription,
    Heading, HeadingDescription,
    QueryTable, QueryTableDescription,
    Input, InputDescription,
    Link, LinkDescription,
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    loadWidget
}
