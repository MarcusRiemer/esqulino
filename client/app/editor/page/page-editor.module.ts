import {NgModule, ModuleWithProviders}  from '@angular/core'

import QueryEditorModule                from '../query/editor.module'
import SharedEditorModule               from '../shared/shared.module'
import {RegistrationService}            from '../registration.service'

import {pageEditorRouting}              from './page-editor.routes'

import {DragService}                    from './drag.service'
import {PageExistsGuard}                from './page-exists.guard'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageDataComponent}              from './page-data.component'
import {ServerPreviewComponent}         from './server-preview.component'

import {BUTTON_REGISTRATION}            from './sidebar/button.sidebar.component'
import {EMBEDDED_HTML_REGISTRATION}     from './sidebar/embedded-html.sidebar.component'
import {HEADING_REGISTRATION}           from './sidebar/heading.sidebar.component'
import {INPUT_REGISTRATION}             from './sidebar/input.sidebar.component'
import {LINK_REGISTRATION}              from './sidebar/link.sidebar.component'
import {PARAGRAPH_REGISTRATION}         from './sidebar/paragraph.sidebar.component'
import {QUERY_TABLE_REGISTRATION}       from './sidebar/query-table.sidebar.component'

import {SidebarDataComponent}           from './page-data.sidebar'
import {SidebarWidgetsComponent}        from './page-widgets.sidebar'

import {PageTreeEditorComponent}        from './tree/editor.component'
import {PageTreeComponent}              from './tree/page-tree.component'
import {WidgetNodeComponent}            from './tree/widget-node.component'
import {WidgetNodeParameterComponent}   from './tree/widget-node-parameter.component'
import {WidgetNodeLoaderComponent}      from './tree/widget-node-loader.component'

import * as Tree                        from './tree/widgets/index'

import {PageVisualEditorComponent}      from './wysiwyg/editor.component'
import {PageLayoutComponent}            from './wysiwyg/page-layout.component'
import {WidgetLoaderComponent}          from './wysiwyg/widget-loader.component'

import * as Visual                      from './wysiwyg/widgets/index'

// Components as defined by the WYSIWYG-editor
const visualComponents = [
    Visual.ButtonComponent,
    Visual.EmbeddedHtmlComponent,
    Visual.HeadingComponent,
    Visual.InputComponent,
    Visual.LinkComponent,
    Visual.ParagraphComponent,
    Visual.QueryTableComponent,
]

// Components as defined by the tree-editor
const treeComponents = [
    WidgetNodeComponent,
    Tree.HeadingComponent,
    Tree.QueryTableComponent,
    Tree.InputComponent,
    Tree.LinkComponent,
    Tree.EmbeddedHtmlComponent,
]

// All sidebars known to the page editor
const sidebarComponents = [
    SidebarDataComponent,
    SidebarWidgetsComponent,
    BUTTON_REGISTRATION.componentType,
    EMBEDDED_HTML_REGISTRATION.componentType,
    HEADING_REGISTRATION.componentType,
    INPUT_REGISTRATION.componentType,
    LINK_REGISTRATION.componentType,
    PARAGRAPH_REGISTRATION.componentType,
    QUERY_TABLE_REGISTRATION.componentType,
]

@NgModule({
    imports: [
        SharedEditorModule,
        QueryEditorModule,
        // pageEditorRouting,
    ],    
    declarations: [
        PageEditorHostComponent,
        PageCreateComponent,
        
        PageDataComponent,
        ServerPreviewComponent,
        
        PageTreeEditorComponent,
        PageTreeComponent,
        WidgetNodeComponent,
        WidgetNodeLoaderComponent,
        
        PageVisualEditorComponent,
        PageLayoutComponent,
        WidgetLoaderComponent,

        ...sidebarComponents,
        ...visualComponents,
        ...treeComponents,
    ],
    entryComponents: [
        ...sidebarComponents,
        ...visualComponents,
        ...treeComponents,
    ],
    providers: [
        PageExistsGuard,
    ],
    exports: [
        PageEditorHostComponent,
        PageCreateComponent,
        PageVisualEditorComponent,
        PageTreeEditorComponent,

        SidebarDataComponent,
        SidebarWidgetsComponent,
        
        ...sidebarComponents,
        ...visualComponents,
        ...treeComponents,
    ]
})
export default class PageEditorModule {
    static forRoot() : ModuleWithProviders {
        return ({
            ngModule : PageEditorModule,
            providers : [DragService]
        });
    }

    constructor(reg : RegistrationService) {
        console.log("Registering PageEditor ...");
        
        reg.registerSidebarType({
            typeId: SidebarDataComponent.SIDEBAR_IDENTIFIER,
            componentType: SidebarDataComponent
        });
        reg.registerSidebarType({
            typeId: SidebarWidgetsComponent.SIDEBAR_IDENTIFIER,
            componentType: SidebarWidgetsComponent
        });

        reg.registerSidebarType(BUTTON_REGISTRATION);
        reg.registerSidebarType(EMBEDDED_HTML_REGISTRATION);
        reg.registerSidebarType(HEADING_REGISTRATION);
        reg.registerSidebarType(INPUT_REGISTRATION);
        reg.registerSidebarType(LINK_REGISTRATION);
        reg.registerSidebarType(PARAGRAPH_REGISTRATION);
        reg.registerSidebarType(QUERY_TABLE_REGISTRATION);

        console.log("Registered PageEditor!");
    }
}
