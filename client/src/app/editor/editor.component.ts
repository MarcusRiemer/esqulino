import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { delay, map, tap } from "rxjs/operators";

import { BrowserService } from "../shared/browser.service";

import { ProjectService, Project } from "./project.service";
import { SidebarService } from "./sidebar.service";
import { PreferencesService } from "./preferences.service";
import { combineLatest } from "rxjs";

@Component({
  templateUrl: "templates/index.html",
})
export class EditorComponent implements OnInit, OnDestroy {
  /**
   * The currently edited project
   */
  private _project: Project = null;

  /**
   * All subscriptions of this editor component.
   */
  private _subscriptions: any[] = [];

  /**
   * Used for dependency injection.
   */
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _sidebarService: SidebarService,
    private readonly _preferences: PreferencesService,
    private readonly _title: Title,
    private readonly _browser: BrowserService
  ) {}

  readonly sidebarMode$ = this._browser.sidebarMode$;

  readonly showSideNav$ = this._preferences.showSideNav$;

  /**
   * Load the project for all sub-components.
   */
  ngOnInit() {
    // Subscribe to the current project
    let subRef = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
      this._title.setTitle(`${res.name} - BlattWerkzeug`);
    });
    this._subscriptions.push(subRef);
  }

  readonly isSidebarVisible$ = combineLatest(
    this._browser.isMobile$,
    this._sidebarService.isSidebarVisible
  ).pipe(
    // Don't show the sidebar on mobile devices
    map(([isMobile, isSidebarVisible]) => isSidebarVisible && !isMobile),
    // Unfortunate hack: Without this slight delay Angular freaks about because it
    // thinks it has perceived an expression with a side-effect. Strangely this only
    // happens when going from "open" to "closed" and never surfaced the over way round.
    //
    // This has the not-so-nice side-effect of sliding the sidebar in on the inital page
    // load, well ...
    delay(1),
    tap((visible) => console.log(`isSidebarVisible:`, visible))
  );

  /**
   * Subscriptions need to be explicitly released
   */
  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];

    this._projectService.forgetCurrentProject();
  }

  onSideNavClosed() {
    this._preferences.setShowSideNav(false);
  }

  /**
   * Read only access to currently edited project.
   */
  get project() {
    return this._project;
  }

  /**
   * @return The current preferences that apply to the current session.
   */
  get preferences() {
    return this._preferences;
  }
}
