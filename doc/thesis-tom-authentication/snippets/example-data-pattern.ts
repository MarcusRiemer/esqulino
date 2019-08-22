import { Component } from '@angular/core';

import { PerformDataService } from '../shared/authorisation/perform-data.service';
@Component({
	templateUrl: "./templates/example.html"
})
class ExampleComponent {
	constructor(
		private _performData: PerformDataService
	) { }

	readonly _newsId = "fda587fa-ba7f-11e9-a2a3-2a2ae2dbcce4";
	readonly performUpdateData = this._performData.news.update(this._newsId);
	readonly performCreateData = this._performData.news.create();
}
