import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, Inject, Input, AfterViewInit } from '@angular/core';

import { first } from 'rxjs/operators';

import { BrowserService } from './browser.service';


@Component({
    selector: 'app-requires-javascript',
    templateUrl: './templates/javascript-required-wrapper.html'
})
export class JavascriptRequiredWrapperComponent implements AfterViewInit {
    // @ViewChild('content') content: ContentRe
    
    warn_message = 'test ';

    ngAfterViewInit() {
       
    }

    constructor (
        @Inject(PLATFORM_ID)
        private readonly _platformId: Object,
        private readonly _browserService: BrowserService
    ) {
        this._browserService.isMobile$.pipe(
            first()
        ).subscribe(isMobile => console.log(`isMobile = ${isMobile}`))
    }

    readonly buildOnServer: boolean = isPlatformServer(this._platformId);
}