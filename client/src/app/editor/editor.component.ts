import {
  Component, OnInit, OnDestroy
} from '@angular/core'
import { Title } from '@angular/platform-browser'

import { delay } from 'rxjs/operators';

import { ProjectService, Project } from './project.service'
import { SidebarService } from './sidebar.service'
import { PreferencesService } from './preferences.service'

@Component({
  templateUrl: 'templates/index.html',
})
export class EditorComponent implements OnInit, OnDestroy {
  /**
   * The currently edited project
   */
  private _project: Project = null;

  /**
   * Cached state of the sidebar, the UI template doesn't
   * like observables.
   */
  private _sidebarVisible = false;

  /**
   * All subscriptions of this editor component.
   */
  private _subscriptions: any[] = [];

  /**
   * Used for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
    private _sidebarService: SidebarService,
    private _preferences: PreferencesService,
    private _title: Title
  ) { }

  /**
   * Load the project for all sub-components.
   */
  ngOnInit() {
    // Subscribe to the current project
    let subRef = this._projectService.activeProject.subscribe(res => {
      this._project = res
      this._title.setTitle(`${res.name} - BlattWerkzeug`)
    });
    this._subscriptions.push(subRef);
  }

  readonly isSidebarVisible$ = this._sidebarService.isSidebarVisible.pipe(
    // Unfortunate hack: Without this slight delay Angular freaks about because it
    // thinks it has perceived an expression with a side-effect. Strangely this only
    // happens when going from "open" to "closed" and never surfaced the over way round
    //
    // This has the not-so-nice side-effect of sliding the sidebar in on the inital page
    // load, well ...
    delay(1),
  );

  /**
   * Subscriptions need to be explicitly released
   */
  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];

    this._projectService.forgetCurrentProject();
  }

  /**
   * @return True, if the sidebar should be visible.
   */
  get isSidebarVisible() {
    return (this._sidebarVisible);
  }

  /**
   * Read only access to currently edited project.
   */
  get project() {
    return (this._project);
  }

  /**
   * @return The current preferences that apply to the current session.
   */
  get preferences() {
    return (this._preferences);
  }
}
