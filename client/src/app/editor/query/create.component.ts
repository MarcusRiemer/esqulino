import {
  Component, OnInit, OnDestroy, Input
} from '@angular/core'
import { Router } from '@angular/router'

import {
  assertValidResourceName, isValidResourceName
} from '../../shared/util'

import { TableDescription } from '../../shared/schema'

import { ProjectService, Project } from '../project.service'
import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'
import { QueryService } from '../query.service'

@Component({
  templateUrl: 'templates/create.html'
})
export class QueryCreateComponent implements OnInit, OnDestroy {
  public project: Project;

  public queryType: string = "select";

  public queryName: string = "";

  @Input()
  public queryTable: string;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  constructor(
    private _projectService: ProjectService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _queryService: QueryService,
    private _router: Router
  ) {

  }

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    this._sidebarService.hideSidebar();

    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    let subRef = this._projectService.activeProject
      .subscribe(res => {
        this.project = res
        if (!this.project.schema.isEmpty) {
          // Assign the first table as an initial choice
          this.queryTable = res.schema.tables[0].name;

          // Actually allow creation
          let btnCreate = this._toolbarService.addButton("create", "Erstellen", "plus", "n");
          let subRef = btnCreate.onClick.subscribe((res) => {
            if (this.isValid) {
              const res = this._queryService.createQuery(this.project,
                this.queryType,
                this.queryName,
                this.queryTable);

              res.subscribe(query => {
                console.log(`New query ${query.id}`);
                this._router.navigate(["/editor", this.project.slug, "query", query.id]);
              });
            }
          });

          this._subscriptionRefs.push(subRef);
        }
      });

    this._subscriptionRefs.push(subRef);
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  public get isNameValid() {
    return (this.queryName
      && isValidResourceName(this.queryName)
      && !this.project.hasQueryByName(this.queryName));
  }

  public get isTableValid() {
    return (!!this.queryTable);
  }

  /**
   * @return True, if the current configuration is valid overall
   */
  get isValid() {
    return (this.isNameValid && this.isTableValid);
  }

  /**
   * @return All tables that are available as initial tables
   */
  get availableTables(): TableDescription[] {
    if (this.project) {
      return (this.project.schema.tables);
    } else {
      return ([]);
    }
  }

  /**
   * @return True, if the database is currently empty
   */
  get isDatabaseEmpty() {
    return (this.project && this.project.schema.isEmpty);
  }
}
