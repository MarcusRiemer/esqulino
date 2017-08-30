import {
  Component, OnInit, OnDestroy, Inject
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { SIDEBAR_MODEL_TOKEN } from '../editor.token'
import { borderCssClass } from '../shared/page-preview.util'

import { Page } from '../../shared/page/index'
import {
  Widget, WidgetDescription, WidgetCategory,
  Heading, HiddenInput, Row, Paragraph, QueryTable, Select,
  Input, Image, Button, EmbeddedHtml, Form, Link, Column
} from '../../shared/page/widgets/index'

import {
  ProjectService, Project
} from '../project.service'

import { DragService, PageDragEvent } from './drag.service'

/**
 * A single entry in the sidebar.
 */
interface SidebarWidgetEntry {
  icon: string
  model: WidgetDescription
  name: string
  category: string
}

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * page. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
  templateUrl: 'templates/sidebar-widgets.html',
  selector: "page-sidebar-widgets",
})
export class SidebarWidgetsComponent implements OnDestroy {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "page-core-widgets" };

  /**
   * The currently edited project
   */
  private _project: Project;

  /**
   * The currently edited page
   */
  private _page: Page;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN) page: Page,
    private _dragService: DragService,
    private _projectService: ProjectService,
    private _routeParams: ActivatedRoute,
    private _router: Router) {
    this._page = page;
    this._project = page.project;
  }

  /**
   * Freeing all subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * @return The CSS-class for the given widget.
   */
  borderCssClass(category: WidgetCategory): string {
    return (borderCssClass(category));
  }

  /**
   * @return The name of the entry
   */
  trackWidgetByName(index: number, entry: SidebarWidgetEntry) {
    return (entry.name);
  }

  /**
   * View Variable: The currently edited page
   */
  get page() {
    return (this._page);
  }

  get availableWidgets(): SidebarWidgetEntry[] {
    return ([
      {
        icon: "fa-align-justify",
        name: "Zeile",
        model: Row.emptyDescription,
        category: "layout",
      },
      {
        icon: "fa-columns",
        name: "Spalte",
        model: Column.emptyDescription,
        category: "layout",
      },
      {
        icon: "fa-header",
        name: "Überschrift",
        model: Heading.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-paragraph",
        name: "Absatz",
        model: Paragraph.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-keyboard-o",
        name: "Eingabe",
        model: Input.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-puzzle-piece",
        name: "Versteckt",
        model: HiddenInput.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-caret-square-o-down ",
        name: "Auswahl",
        model: Select.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-square-o",
        name: "Knopf",
        model: Button.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-arrow-right",
        name: "Link",
        model: Link.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-picture-o",
        name: "Bild",
        model: Image.emptyDescription,
        category: "widget",
      },
      {
        icon: "fa-object-group",
        name: "Formular",
        model: Form.emptyDescription,
        category: "structural",
      },
      {
        icon: "fa-table",
        name: "Datentabelle",
        model: QueryTable.emptyDescription,
        category: "structural",
      },
      {
        icon: "fa-code",
        name: "HTML",
        model: EmbeddedHtml.emptyDescription,
        category: "structural",
      },
    ]);
  }

  /**
   * Registers the start of a drag operation for a widget with the
   * drag service.
   */
  onStartWidgetDrag(evt: DragEvent, model: WidgetDescription) {
    this._dragService.startWidgetDrag(evt, "sidebar", model);
  }
}
