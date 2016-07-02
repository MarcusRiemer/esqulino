import {
    Component, Input, OnInit, ElementRef
} from '@angular/core'
import {DomSanitizationService}         from '@angular/platform-browser';

import {Observable}                     from 'rxjs/Observable'
import {Subject}                        from 'rxjs/Subject'

import {Page}                           from '../../shared/page/index'

import {SidebarService}                 from '../sidebar.service'
import {PageService}                    from '../page.service'
import {Project}                        from '../project'

/**
 * Previewing the rendered output from the server
 */
@Component({
    selector: 'esqulino-server-preview',
    templateUrl: 'app/editor/page/templates/server-preview.html'
})
export class ServerPreviewComponent implements OnInit {
    @Input() page : Page;
    @Input() project : Project;
    @Input() isRendering : boolean = true;

    private _renderPreview : string;

    constructor(
        private _elementRef: ElementRef,
        private _pageService : PageService,
        private _sanitizer: DomSanitizationService
    ) {
    }

    /**
     * Retrieves the "raw" HTML string that was computed by the server.
     */
    get renderPreview() {
        return (this._sanitizer.bypassSecurityTrustHtml(this._renderPreview));
    }
    
    ngOnInit() {
        
    }

    refreshHeight() {
        const iframe = this._elementRef.nativeElement.querySelector("iframe");
        iframe.height = (iframe.contentWindow.document.body.scrollHeight + 10) + "px"
    }

    refresh() : Observable<boolean> {   
        const toReturn = new Subject<boolean>();
        
        this._pageService.renderPage(this.project, this.page)
            .subscribe(res => {
                // Store the result and inform subscribers
                this._renderPreview = res;
                toReturn.next(true);
                toReturn.complete();


                Observable.timer(100)
                    .subscribe(t => this.refreshHeight());
            });

        return (toReturn);

    }
}
