import {Component, OnInit}              from 'angular2/core';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {Router, ROUTER_DIRECTIVES}      from 'angular2/router';

@Component({
    templateUrl: 'app/editor/templates/schema.html',
    directives: [ROUTER_DIRECTIVES]
})
export class SchemaComponent implements OnInit {


    ngOnInit() {
        console.log("Schema running");
    }
}
