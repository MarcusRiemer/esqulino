import {Component, Input, OnInit}     from '@angular/core';
import { Router, ActivatedRoute }     from '@angular/router'

import {ProjectService, Project}      from '../project.service'
import {SidebarService}               from '../sidebar.service'
import {ToolbarService}               from '../toolbar.service'

@Component({
    templateUrl: 'templates/schema.html'
})

/**
 * A class as entry-point for the representation of a schema
 */
export class SchemaComponent implements OnInit {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs: any[] = [];

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _toolbarService: ToolbarService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _sidebarService: SidebarService
    ) {
        this._sidebarService.hideSidebar();
    }

    /**
     * @return True, if this is an empty schema
     */
    get isEmpty() {
        return (this.project && this.project.schema.isEmpty);
    }

    /**
     * @return A timestamp to ensure the schema-image is reloaded
     */
    get schemaTimestamp() {
        return (Math.floor(new Date().getTime() / 1000));
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;

        // Button to show the preview of the currently editing table
        let btnCreate = this._toolbarService.addButton("createTable", "Neue Tabelle", "table", "n");
        let subRef = btnCreate.onClick.subscribe((res) => {
            this._router.navigate(["./create"], { relativeTo: this._route });
        })
        this._subscriptionRefs.push(subRef);
        
        subRef = this._projectService.activeProject
            .subscribe(res =>{
                 this.project = res
            });
        this._subscriptionRefs.push(subRef);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

}
