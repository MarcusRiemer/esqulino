import { Component, OnDestroy, Inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { Query, ResultColumn } from '../../shared/query'
import {
  Page, QueryReference
} from '../../shared/page/index'
import {
  Heading, Row, Paragraph, QueryTable, Input, Button, EmbeddedHtml, Link, Form
} from '../../shared/page/widgets/index'

import { SIDEBAR_MODEL_TOKEN } from '../editor.token'
import { ProjectService, Project } from '../project.service'

import { DragService, PageDragEvent } from './drag.service'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * page. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
  templateUrl: 'templates/sidebar-data.html',
  selector: "page-sidebar"
})
export class SidebarDataComponent implements OnDestroy {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "page-core-data" };

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN) private _page: Page,
    private _dragService: DragService,
    private _projectService: ProjectService,
    private _routeParams: ActivatedRoute,
    private _router: Router) {
  }

  /**
   * Freeing all subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * View Variable: The currently edited page
   */
  get page() {
    return (this._page);
  }

  /**
   * Something is being dragged over the "add query reference" drop-zone.
   */
  onAddQueryReferenceDrag(evt: DragEvent) {
    const pageEvt = <PageDragEvent>JSON.parse(evt.dataTransfer.getData('text/plain'));
    if (pageEvt.queryRef) {
      evt.preventDefault();
    }
  }

  /**
   * Something is being dropped over the "add query reference" drop-zone.
   */
  onAddQueryReferenceDrop(evt: DragEvent) {
    const pageEvt = <PageDragEvent>JSON.parse(evt.dataTransfer.getData('text/plain'));
    if (pageEvt.queryRef) {
      evt.preventDefault();
      try {
        this.page.addQueryReference(pageEvt.queryRef);
      } catch (ex) {
        alert(ex);
      }
    }
  }

  /**
   * Starts a drag action for a column reference.
   */
  startColumnDrag(evt: DragEvent,
    queryRef: QueryReference,
    column: ResultColumn) {
    this._dragService.startColumnRefDrag(evt, "sidebar", {
      columnName: column.shortName,
      queryName: queryRef.name
    });
  }

  /**
   * Starts a drag action for a interpolated value.
   */
  startConstantDrag(evt: DragEvent,
    constant: string) {
    this._dragService.startValueDrag(evt, "sidebar", constant);
  }

  /**
   * Informs the drag service about a started drag operation for a
   * query reference
   */
  startReferencedQueryDrag(evt: DragEvent, ref: QueryReference) {
    this._dragService.startQueryRefDrag(evt, "sidebar", ref.toModel(), {
      onRemove: () => {
        this.page.removeQueryReference(ref);
      }
    });
  }

  startParameterValueProviderDrag(evt: DragEvent, valueProviderName: string) {
    this._dragService.startValueDrag(evt, "sidebar", valueProviderName);
  }

  /**
   * Columns are tracked by their full name
   */
  trackByColumnId(index: number, columnRef: ResultColumn) {
    return (columnRef.fullName);
  }

  get availableConstants(): string[] {
    return (["project.name", "page.name"]);
  }

  /**
   * @return All available forms that would provide data
   */
  get availableForms() {
    return (this.page.allWidgets.filter((w) => w instanceof Form) as Form[]);
  }

  /**
   * Is there any data available?
   */
  get hasAnyData(): boolean {
    return (this.showPageRequestParameters || this.referencedQueries.length > 0);
  }

  /**
   * Bootstrap Specific!
   * May be used to highlight the whole card, in case something is terribly wrong.
   */
  get additionalCardClasses(): string {
    return ("");
  }

  /**
   * @return All queries that are actually used on this page.
   */
  get referencedQueries(): QueryReference[] {
    if (this._page) {
      return (this._page.referencedQueries);
    } else {
      return ([]);
    }
  }

  /**
   * @return True, if page request parameters should be shown
   */
  get showPageRequestParameters() {
    return (this.page && this._page.requestParameters.length > 0);
  }

  /**
   * @return True, if a new query could be dropped onto this page.
   */
  get showQueryDropTarget(): boolean {
    return !!(this._dragService.currentDrag
      && this._dragService.activeOrigin == "sidebar"
      && this._dragService.currentDrag.queryRef);
  }
}

