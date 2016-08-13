import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import {SharedEditorModule}             from '../shared/shared.module'

import {pageEditorRouting}              from './page-editor.routes'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageDataComponent}              from './page-data.component'

import {PageTreeEditorComponent}        from './tree/editor.component'
import {WidgetNode}                     from './tree/widget-node.component'

import {PageVisualEditorComponent}      from './wysiwyg/editor.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        pageEditorRouting,
        SharedEditorModule
    ],    
    declarations: [
        PageEditorHostComponent,
        PageCreateComponent,
        
        PageTreeEditorComponent,
        WidgetNode,
        
        PageVisualEditorComponent,
    ],
    
})
export class PageEditorModule {}
