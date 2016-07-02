import {Component}                        from '@angular/core'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph-sidebar.html',
})
export class ParagraphSidebarComponent {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    static get SIDEBAR_IDENTIFIER() { return "page-paragraph" };
}

