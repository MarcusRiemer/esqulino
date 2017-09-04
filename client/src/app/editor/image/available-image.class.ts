import { Project } from '../project.service'

import { ProjectResource, ProjectResourceDescription } from '../../shared/resource'
import { CURRENT_API_VERSION } from '../../shared/resource.description'

import { ServerApiService } from '../../shared/serverapi.service'

export interface AvailableImageDescription extends ProjectResourceDescription {
    "author-name": string;
    "author-url": string;
}

export class AvailableImage extends ProjectResource {
    private _authorName: string
    private _authorUrl
    private _urlTimestamp: number

    constructor(
        private _serverApi: ServerApiService,
        project: Project,
        desc: AvailableImageDescription
    ){
        super(project, desc);

        this._authorUrl = desc["author-url"];
        this._authorName = desc["author-name"];

        this._urlTimestamp = new Date().getTime();
    }

    get url() {
        return (this._serverApi.getImageUrl(this.project.id, this.id) + '?_ts=' + this._urlTimestamp);
    }

    get authorUrl() {
        return (this._authorUrl);
    }

    set authorUrl(val: string) {
        this._authorUrl = val;
    }

    get authorName() {
        return (this._authorName);
    }

    set authorName(val: string) {
        this._authorName = val;
    }

    toModel(): AvailableImageDescription {
        return ({
            'apiVersion': CURRENT_API_VERSION,

            'id': this.id,
            'name': this.name,

            'author-name': this.authorName,
            'author-url': this.authorUrl
        } as AvailableImageDescription);
    }
}
