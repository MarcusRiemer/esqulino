import {Component, OnInit}                 from '@angular/core'
import {Title}                             from '@angular/platform-browser'


/**
 * Host-component for the front-page.
 */
@Component({
    selector: 'about',
    templateUrl: 'templates/about.html',
})
export class AboutComponent implements OnInit {

    constructor(private _title : Title) {}

    ngOnInit() {
        this._title.setTitle("BlattWerkzeug");
    }
}
