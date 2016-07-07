import {
    Injectable, Type
} from '@angular/core'

import {BehaviorSubject}             from 'rxjs/BehaviorSubject'
import {Observable}                  from 'rxjs/Observable'

import {SIDEBAR_MODEL_TOKEN}         from './sidebar.token'

/*import {
    ParagraphSidebarComponent, PARAGRAPH_SIDEBAR_IDENTIFIER
} from './page/widgets/paragraph.sidebar.component'
import {
    HeadingSidebarComponent
} from './page/widgets/heading.sidebar.component'*/
import * as Query                    from './query/sidebar.component'
import * as Page                     from './page/sidebar.component'

/**
 * Manages the global state of the sidebar.
 */
@Injectable()
export class SidebarService {
    
    private _model : BehaviorSubject<SidebarModel>;

    /**
     * Valid types for sidebars.
     * TODO: Allow different sidebars to somehow register themself.
     */
    private _knownTypes : { [typeName:string] : Type} = { };

    constructor() {
        this._model = new BehaviorSubject<SidebarModel>(undefined);

        const pageId = Page.SidebarComponent.SIDEBAR_IDENTIFIER;
        const queryId = Query.SidebarComponent.SIDEBAR_IDENTIFIER;

        this.registerType(pageId, Page.SidebarComponent);
        //this.registerType("page-paragraph", ParagraphSidebarComponent);
        //this.registerType("page-heading", Page.SidebarComponent);

        this.registerType(queryId, Query.SidebarComponent);
    }

    /**
     * Hides the currently shown sidebar.
     */
    hideSidebar() {
        this._model.next(undefined);
    }

    /**
     * Registers a new type of sidebar that is ready for use.
     *
     * @param newType The string ID that is used to request this type.
     * @param component The component constructr that should be used.
     */
    registerType(newType : string, componentType : Type) {
        if (this.isKnownType(newType)) {
            throw new Error(`Attempted to override sidebar type "${newType}"`);
        }

        this._knownTypes[newType] = componentType;        
    }

    /**
     * @return True, if the given type could be shown by the sidebar.
     */
    isKnownType(newType : string) : boolean {
        return (!!this._knownTypes[newType]);
    }

    /**
     * @return The component type for the given identifier.
     */
    getComponentType(newType : string) : Type {
        return (this._knownTypes[newType]);
    }

    /**
     * Triggers showing a different sidebar.
     * 
     * @newType The new type of sidebar to show. This is a string, but
     *          the identifier should be retrieved using the 
     *          SIDEBAR_IDENTIFIER property of the Sidebar Component you
     *          are using.
     */
    showSidebar(newType : string, param? : any) {
        if (!this.isKnownType(newType)) {
            throw new Error(`Unknown sidebar type: ${newType}`);
        }

        this._model.next({
            type : newType,
            param : param
        });
    }

    /**
     * @return An observable that raises events when
     *         the visibilit changes.
     */
    get isSidebarVisible() : Observable<boolean> {
        return (this._model.map(s => !!s));
    }

    /**
     * @return An observable for the current type of the sidebar
     */
    get sidebarModel() : Observable<SidebarModel> {
        return (this._model);
    }
}

/**
 *
 */
export interface SidebarModel {
    type : string
    param? : any
}

