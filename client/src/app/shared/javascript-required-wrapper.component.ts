import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, Inject, Input, AfterViewInit, SimpleChanges } from '@angular/core';

import { first } from 'rxjs/operators';

import { BrowserService } from './browser.service';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { Subject } from 'rxjs';
import { showReportDialog } from '@sentry/browser';


@Component({
    selector: 'app-requires-javascript',
    templateUrl: './templates/javascript-required-wrapper.html'
})
export class JavascriptRequiredWrapperComponent {
    // @ViewChild('content') content: ContentRe

    @Input('headline') readonly headline: String;
    @Input('message') readonly message: String;
    @Input('alwaysShowInactive') readonly forceDisplay: boolean;
    @Input('showMessage') readonly showMessage: boolean = this.showMessage || true;

    constructor (
        @Inject(PLATFORM_ID)
        private readonly _platformId: Object
    ) {}

    readonly jsDisabled: boolean = isPlatformServer(this._platformId);
}