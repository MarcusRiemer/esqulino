import {
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription
} from '../page.description'

import {Widget, WidgetDescription}         from './widget'
import {loadWidget}                        from './widget-loader'

import {Row, RowDescription}               from './row'
import {Column, ColumnDescription}         from './column'

import {
    QueryAction, ParameterMapping,
    QueryActionDescription, ParameterMappingDescription
} from './action'

import {Button, ButtonDescription}         from './button'
import {Heading, HeadingDescription}       from './heading'
import {Input, InputDescription}           from './input'
import {Paragraph, ParagraphDescription}   from './paragraph'
import {QueryTable, QueryTableDescription} from './query-table'

export {
    Widget, WidgetDescription,
    Row, RowDescription,
    Column, ColumnDescription,
    QueryAction, ParameterMapping,
    QueryActionDescription, ParameterMappingDescription,
    Button, ButtonDescription,
    Paragraph, ParagraphDescription,
    Heading, HeadingDescription,
    QueryTable, QueryTableDescription,
    Input, InputDescription,
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    loadWidget
}
