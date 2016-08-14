import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import {QueryIconComponent}             from './query-icon.component'
import {SidebarItemHost}                from './sidebar-item-host.component'

@NgModule({
    imports : [
        CommonModule,
        FormsModule
    ],
    declarations: [
        QueryIconComponent,
        SidebarItemHost,
    ],
    exports: [
        QueryIconComponent,
        SidebarItemHost,
        CommonModule,
        FormsModule
    ]
})
export class SharedEditorModule { }
