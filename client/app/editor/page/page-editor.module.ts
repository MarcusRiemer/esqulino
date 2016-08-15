import {NgModule, ModuleWithProviders}  from '@angular/core'

import SharedEditorModule               from '../shared/shared.module'

import {pageEditorRouting}              from './page-editor.routes'

import {DragService}                    from './drag.service'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageDataComponent}              from './page-data.component'
import {ServerPreviewComponent}         from './server-preview.component'

import {SidebarDataComponent}           from './page-data.sidebar'
import {SidebarWidgetsComponent}        from './page-widgets.sidebar'

import {PageTreeEditorComponent}        from './tree/editor.component'
import {PageTreeComponent}              from './tree/page-tree.component'
import {WidgetNode}                     from './tree/widget-node.component'

import {PageVisualEditorComponent}      from './wysiwyg/editor.component'
import {PageLayoutComponent}            from './wysiwyg/page-layout.component'
import {WidgetLoaderComponent}          from './wysiwyg/widget-loader.component'
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
        // pageEditorRouting,
    ],    
    declarations: [
        PageEditorHostComponent,
        PageCreateComponent,

        PageDataComponent,
        ServerPreviewComponent,

        SidebarDataComponent,
        SidebarWidgetsComponent,
        
        PageTreeEditorComponent,
        PageTreeComponent,
        WidgetNode,
        
        PageVisualEditorComponent,
        PageLayoutComponent,
        WidgetLoaderComponent,

        ButtonComponent,
        EmbeddedHtmlComponent,
        HeadingComponent,
        InputComponent,
        LinkComponent,
        ParagraphComponent,
        QueryTableComponent,
    ],
    entryComponents: [
        ButtonComponent,
        EmbeddedHtmlComponent,
        HeadingComponent,
        InputComponent,
        LinkComponent,
        ParagraphComponent,
        QueryTableComponent,

        SidebarDataComponent,
        SidebarWidgetsComponent,
    ],
    exports: [
        PageEditorHostComponent,
        PageCreateComponent,
        PageVisualEditorComponent,
        PageTreeEditorComponent,

        SidebarDataComponent,
        SidebarWidgetsComponent,

        ButtonComponent,
        EmbeddedHtmlComponent,
        HeadingComponent,
        InputComponent,
        LinkComponent,
        ParagraphComponent,
        QueryTableComponent,
    ]
})
export default class PageEditorModule {
    static forRoot() : ModuleWithProviders {
        return ({
            ngModule : PageEditorModule,
            providers : [DragService]
        });
    }
}
