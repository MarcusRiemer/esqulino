import {Injectable, Type}            from '@angular/core'

import {BehaviorSubject}             from 'rxjs/BehaviorSubject'
import {Observable}                  from 'rxjs/Observable'

import {SIDEBAR_MODEL_TOKEN}         from './editor.token'
import {SidebarComponent}            from './query/sidebar.component'
import {SidebarDataComponent}        from './page/sidebar-data.component'
import {SidebarWidgetsComponent}     from './page/sidebar-widgets.component'

/**
 * Manages the global state of the sidebar.
 */
@Injectable()
export class SidebarService {
    
    private _model : BehaviorSubject<SidebarModel[]>;

    /**
     * Valid types for sidebars.
     * TODO: Allow different sidebars to somehow register themself.
     */
    private _knownTypes : { [typeName:string] : Type} = { };

    constructor() {
        this._model = new BehaviorSubject<SidebarModel[]>([]);

        const pageDataId = SidebarDataComponent.SIDEBAR_IDENTIFIER;
        const pageWidgetsId = SidebarWidgetsComponent.SIDEBAR_IDENTIFIER;
        const queryId = SidebarComponent.SIDEBAR_IDENTIFIER;

        this.registerType(pageDataId, SidebarDataComponent);
        this.registerType(pageWidgetsId, SidebarWidgetsComponent);
        this.registerType(queryId, SidebarComponent);
    }

    /**
     * Hides the currently shown sidebar.
     */
    hideSidebar() {
        this._model.next([]);
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
     * @param newType The new type of sidebar to show. This is a
     *    string, but the identifier should be retrieved using the 
     *    SIDEBAR_IDENTIFIER property of the Sidebar Component you
     *    are using.
     * @param param The parameter to pass to the sidebar, this depends
     *    on the sidebar that is going to be displayed.
     */
    showSingleSidebar(newType : string, param? : any) {
        this.showMultiple([
            { type : newType, param : param }
        ]);
    }

    /**
     * Triggers showing multiple different sidebars.
     */
    showMultiple(mult : SidebarModel[]) {
        // Ensure every type is known. This does not use `every`
        // but `forEach` with a side-effect because we wan't to
        // know the offending type.
        mult.forEach(e => {
            if (!this.isKnownType(e.type)) {
                throw new Error(`Unknown sidebar type: ${e.type}`);
            }
        });

        // Kick off the rendering by placing a new value in the observable
        this._model.next(mult);
    }

    /**
     * Hides a single sidebar.
     */
    hideByIndex(index : number) {
        const model = this._model.getValue();
        model.splice(index, 1);

        this._model.next(model);
    }

    /**
     * @return An observable that raises events when
     *         the visibility of the sidebar changes.
     */
    get isSidebarVisible() : Observable<boolean> {
        return (this._model.map(s => s.length > 0));
    }

    /**
     * @return An observable for the current type of the sidebar
     */
    get sidebarModel() : Observable<SidebarModel[]> {
        return (this._model);
    }
}

/**
 * Denotes a sidebar component that should be rendered.
 */
export interface SidebarModel {
    type : string
    param? : any
}

