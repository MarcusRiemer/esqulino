import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'
import {RouterModule}                   from '@angular/router'

import {QueryIconComponent}             from './query-icon.component'
import {SidebarItemHost}                from './sidebar-item-host.component'

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        RouterModule,
    ],
    declarations: [
        QueryIconComponent,
        SidebarItemHost,
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        
        QueryIconComponent,
        SidebarItemHost,
    ]
})
export default class SharedEditorModule { }
