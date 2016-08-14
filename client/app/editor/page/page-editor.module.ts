import {NgModule}                       from '@angular/core'

import {SharedEditorModule}             from '../shared/shared.module'

import {pageEditorRouting}              from './page-editor.routes'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageDataComponent}              from './page-data.component'

import {PageTreeEditorComponent}        from './tree/editor.component'
import {WidgetNode}                     from './tree/widget-node.component'

import {PageVisualEditorComponent}      from './wysiwyg/editor.component'
import {ButtonComponent}                from './wysiwyg/widgets/button.component'
import {EmbeddedHtmlComponent}          from './wysiwyg/widgets/embedded-html.component'
import {HeadingComponent}               from './wysiwyg/widgets/heading.component'
import {InputComponent}                 from './wysiwyg/widgets/input.component'
import {LinkComponent}                  from './wysiwyg/widgets/link.component'
import {ParagraphComponent}             from './wysiwyg/widgets/paragraph.component'
import {QueryTableComponent}            from './wysiwyg/widgets/query-table.component'

@NgModule({
    imports: [
        SharedEditorModule,
        pageEditorRouting,
    ],    
    declarations: [
        PageEditorHostComponent,
        PageCreateComponent,
        
        PageTreeEditorComponent,
        WidgetNode,
        
        PageVisualEditorComponent,
    ],
    entryComponents: [
        ButtonComponent,
        EmbeddedHtmlComponent,
        HeadingComponent,
        InputComponent,
        LinkComponent,
        ParagraphComponent,
        QueryTableComponent,
    ]
})
export class PageEditorModule {}
