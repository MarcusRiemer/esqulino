import{Component, Input}                  from '@angular/core'

@Component({
    selector: 'sidebar-item-host',
    templateUrl: 'app/editor/templates/sidebar-item-host.html'
})
export class SidebarItemHost {
    @Input() header : string;
}
