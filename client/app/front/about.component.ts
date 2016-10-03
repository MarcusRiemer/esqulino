import {Component, OnInit}                 from '@angular/core'
import {Title}                             from '@angular/platform-browser'

@Component({
    selector: 'about',
    templateUrl: 'app/front/templates/about.html',
})
export class AboutComponent {

    constructor(private _title : Title) {}
    
    ngOnInit() {
        this._title.setTitle("esqulino");
    }
}
