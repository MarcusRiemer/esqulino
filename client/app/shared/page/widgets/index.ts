import {
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription
} from '../page.description'

import {Widget, WidgetDescription}         from './widget'
import {loadWidget}                        from './widget-loader'

import {Row, RowDescription}               from './row'
import {Column, ColumnDescription}         from './column'

import {Paragraph, ParagraphDescription}   from './paragraph'
import {Heading, HeadingDescription}       from './heading'
import {QueryTable, QueryTableDescription} from './query-table'

export {
    Widget, WidgetDescription,
    Row, RowDescription,
    Column, ColumnDescription,
    Paragraph, ParagraphDescription,
    Heading, HeadingDescription,
    QueryTable, QueryTableDescription,
    ValueReferenceDescription, ColumnReferenceDescription, QueryReferenceDescription,
    loadWidget
}
