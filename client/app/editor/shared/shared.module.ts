import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'

import {QueryIconComponent}             from './query-icon.component'
import {SidebarItemHost}                from './sidebar-item-host.component'

@NgModule({
    imports : [
        CommonModule,
    ],
    declarations: [
        QueryIconComponent,
        SidebarItemHost,
    ],
    exports: [
        QueryIconComponent,
        SidebarItemHost,
    ]
})
export class SharedEditorModule { }
