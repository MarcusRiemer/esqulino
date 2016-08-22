import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'
import {RouterModule}                   from '@angular/router'

import {QueryIconComponent}             from './query-icon.component'
import {SidebarItemHost}                from './sidebar-item-host.component'
import {ContenteditableModel}           from './contenteditable-model.directive'

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        RouterModule,
    ],
    declarations: [
        QueryIconComponent,
        SidebarItemHost,
        ContenteditableModel,
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        
        QueryIconComponent,
        SidebarItemHost,
        ContenteditableModel,
    ]
})
export default class SharedEditorModule { }
