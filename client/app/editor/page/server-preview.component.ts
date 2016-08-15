import {
    Component, Input, OnInit, ElementRef
} from '@angular/core'
import {DomSanitizationService}         from '@angular/platform-browser';

import {Observable}                     from 'rxjs/Observable'
import {Subject}                        from 'rxjs/Subject'

import {Page}                           from '../../shared/page/index'

import {SidebarService}                 from '../sidebar.service'
import {PageService}                    from '../page.service'
import {Project}                        from '../project.service'

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

    /**
     * TODO: Make this configurable
     */
    useSobdomain = true;
    
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

    /**
     * @return The currently visited hostname
     */
    get hostname() : string {
        return (window.location.host);
    }

    get viewUrl() : string {
        if (this.useSobdomain) {
            // TODO: Find out whether it would be more or less trivially
            //       possible to support HTTPs
            return (`http://${this.project.id}.${this.hostname}/${this.page.id}`);
        } else {
            return (`/view/${this.project.id}/${this.page.id}`)
        }
    }
    
    ngOnInit() {
        
    }

    /**
     * Refreshes the height of the preview immediatly or re-schedules a refresh
     * because the preview isn't done yet.
     *
     * @param triesLeft The number of times the refresh should be retried in case
     *                  of failure.
     */
    refreshHeight(triesLeft : number) {
        const iframe = this._elementRef.nativeElement.querySelector("iframe");

        // Is something meaningful loaded in the iframe?
        if (!iframe || !iframe.contentWindow.document.body) {
            // No, are there retries lief?
            if (triesLeft > 0) {
                // Yes, retry
                const newTimes = triesLeft - 1;
                console.log(`Could not resize, trying again ${newTimes} more times`);
                Observable.timer(100)
                    .subscribe(t => this.refreshHeight(newTimes));
            } else {
                // No, give up
                console.log(`Could not resize, ran out of retry attempts`);
            }

        } else {
            // Yes, set a meaningful height
            iframe.height = (iframe.contentWindow.document.body.scrollHeight + 10) + "px"
        }
    }

    refresh() : Observable<boolean> {   
        const toReturn = new Subject<boolean>();
        
        this._pageService.renderPage(this.project, this.page)
            .subscribe(res => {
                // Store the result and inform subscribers
                this._renderPreview = res;
                toReturn.next(true);
                toReturn.complete();

                this.refreshHeight(5);
            });

        return (toReturn);

    }
}
