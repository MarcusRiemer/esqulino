import {
  Component, Input, Output, ElementRef, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { Page } from '../../shared/page/index'
import { KeyValuePairs, encodeUriParameters } from '../../shared/util'

import { SidebarService } from '../sidebar.service'
import { PageService } from '../page.service'
import { Project } from '../project.service'

/**
 * Previewing the rendered output from the server
 */
@Component({
  selector: 'esqulino-server-preview',
  templateUrl: 'templates/server-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerPreviewComponent {
  @Input() page: Page;
  @Input() project: Project;

  @Output() closed = new EventEmitter();

  /**
   * The different values the user has entered so far.
   */
  cachedArguments: KeyValuePairs = {};

  /**
   * Is there anything that could be rendered?
   */
  private _hasRenderPreview: boolean = false;

  /**
   * TODO: Make this configurable
   */
  useSobdomain = true;

  constructor(
    private _pageService: PageService,
    private _sanitizer: DomSanitizer,
    private _elementRef: ElementRef,
    private _cd: ChangeDetectorRef
  ) {
  }

  /**
   * The user has decided to hide the preview
   */
  doClose() {
    console.log("doClose()");
    this.closed.emit();
  }

  /**
   * The user has decided to view the preview in a dedicated window.
   */
  onNavigateFullPreview(event: MouseEvent) {
    // Is the client state different from the server state? If that is the case
    // the user would be surprised by a very different page.
    if (this.page.isSavingRequired) {
      // Ask the user whether he wants to save?
      if (confirm("Damit die Seite in einem neuen Tab korrekt angezeigt wird, muss sie gespeichert werden. Jetzt Speichern?")) {

        // He wants to! Delay the navigation until the page has been saved.
        event.preventDefault();
        this._pageService.savePage(this.project, this.page)
          .first()
          .subscribe(_ => {
            const win = window.open(this.viewUrl, '_blank');
            win.focus();

            // Sync the inline preview
            this.refresh();
          });
      }
    } else {
      // Sync the inline preview immediatly
      this.refresh();
    }
  }

  /**
   * @return The DOM <iframe> element or undefined, if no iframe is currently
   *         present.
   */
  get domIframe(): HTMLIFrameElement {
    return (this._elementRef.nativeElement.querySelector("iframe"));
  }

  /**
   * @return True, if a render preview is available.
   */
  get hasRenderPreview(): boolean {
    return (this._hasRenderPreview);
  }

  /**
   * @return The currently visited hostname
   */
  get hostname(): string {
    return (window.location.host);
  }

  /**
   * All arguments that would be required to render the current page.
   */
  get relevantArguments(): KeyValuePairs {
    const toReturn: KeyValuePairs = {};

    this.page.requestParameters.forEach(param => {
      toReturn[param.name] = this.cachedArguments[param.name];
    });

    return (toReturn);
  }

  /**
   * @return The URL that would be currently used to navigate to the page.
   */
  get viewUrl(): string {
    // TODO: Find out whether it would be more or less trivially
    //       possible to support HTTPs for all those user-generated
    //       subdomains.
    let url = this.useSobdomain
      ? `http://${this.project.slug}.${this.hostname}/${this.page.name}`
      : `/view/${this.project.slug}/${this.page.name}`;

    // Possibly append GET parameters
    if (this.anyParametersAvailable) {
      url += "?" + encodeUriParameters(this.cachedArguments);
    }

    return (url);
  }

  /**
   * @return True, if the page to be previewed won't render properly without
   *         parameters.
   */
  get parametersRequired(): boolean {
    return (this.page && this.page.requestParameters.length > 0);
  }

  /**
   * @return All parameters that are required to run this page.
   */
  get requestParameters() {
    return (this.page.requestParameters);
  }

  /**
   * @return True, if any required parameters has a user provided value.
   */
  get anyParametersAvailable() {
    return (this.page.requestParameters.some(p => this.isParameterAvailable(p.name)));
  }

  /**
   * @return True, if all required parameters have a user provided value.
   */
  get allParametersAvailable() {
    return (this.page.requestParameters.every(p => this.isParameterAvailable(p.name)));
  }

  /**
   * @return True, if the given parameter is available.
   */
  isParameterAvailable(name: string) {
    return (name in this.cachedArguments);
  }

  /**
   * Refreshes the height of the preview immediatly.
   */
  refreshHeight() {
    const iframe = this.domIframe;
    iframe.height = (iframe.contentWindow.document.body.scrollHeight + 10) + "px";
  }

  /**
   * Refreshes if the preview can be rendered meaningfully.
   */
  invalidateRefresh() {
    this._hasRenderPreview = undefined;
    this._cd.markForCheck();

    if (this.allParametersAvailable) {
      this.refresh();
    }
  }

  /**
   * Resends the request to the server and updates the preview afterwards.
   */
  refresh(): Observable<boolean> {
    this._hasRenderPreview = undefined;
    this._cd.markForCheck();

    const toReturn = new Subject<boolean>();
    console.log("Refreshing Page-Preview!");

    this._pageService.renderPage(this.project, this.page, this.cachedArguments)
      .subscribe(res => {
        // Set the new document and listen for height changes.
        this._hasRenderPreview = true;
        (this.domIframe as any).srcdoc = res;
        this.domIframe.onload = (ev => {
          this.refreshHeight();
        });

        // Inform subscribers that something went well
        toReturn.next(true);
        toReturn.complete();

        // Ensure the iframe is actually up 2 date
        this._cd.markForCheck();
      }, err => {
        console.log("Couldn't render page");

        // Inform subscribers that something went wrong
        toReturn.next(false);
        toReturn.complete();

        // Ensure the iframe is actually up 2 date
        this._cd.markForCheck();
      });

    return (toReturn);
  }
}
