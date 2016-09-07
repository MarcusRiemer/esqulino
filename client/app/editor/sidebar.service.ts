import {Injectable, Type}            from '@angular/core'

import {BehaviorSubject}             from 'rxjs/BehaviorSubject'
import {Observable}                  from 'rxjs/Observable'

import {SIDEBAR_MODEL_TOKEN}         from './editor.token'
import {RegistrationService}         from './registration.service'

/**
 * Manages the global state of the sidebar. Components should *never*
 * interact with the sidebar directly but always use this service 
 * instead.
 */
@Injectable()
export class SidebarService {

    /**
     * Used to hand out IDs that are guaranteed to be unique.
     * These IDs are then later used to distinguish created
     * sidebar components.
     */
    private static _idCounter : number = 0;

    /**
     * The model that is currently displayed (or at least will
     * be displayed the next tick).
     */
    private _model : BehaviorSubject<InternalSidebarModel[]>;

    /**
     * Valid types for sidebars.
     */
    private _knownTypes : { [typeName:string] : Type<any>} = { };

    constructor(registrationService : RegistrationService) {
        this._model = new BehaviorSubject<InternalSidebarModel[]>([]);

        registrationService.sidebarTypes.subscribe( reg => {
            this.registerType(reg.typeId, reg.componentType);
        });
    }

    /**
     * Hides the currently shown sidebar.
     */
    hideSidebar() {
        console.log("SidebarService: Hidden!");
        this._model.next([]);
    }

    /**
     * Registers a new type of sidebar that is ready for use. Never do this
     * on an instance of the service directly, instead use the RegistrationService.
     *
     * @see RegistrationService
     *
     * @param newType The string ID that is used to request this type.
     * @param component The component constructr that should be used.
     */
    private registerType(newType : string, componentType : Type<any>) {
        if (this.isKnownType(newType)) {
            console.log(`Overwriting sidebar type "${newType}"`);
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
    getComponentType(newType : string) : any {
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
     *
     * @return The ID of the single sidebar.
     */
    showSingleSidebar(newType : string, sticky : boolean, param? : any) : number {
        const ids = this.showMultiple([
            { type : newType, param : param }
        ]);

        // Return the single Id that we added
        return (ids[0]);
    }

    showAdditionalSidebar(newType : string, param? : any) : number {
        const ids = this.showMultiple([
            { type : newType, param : param }
        ], false);

        // Return the single Id that we added
        return (ids[0]);
    }

    /**
     * Triggers showing multiple different sidebars.
     *
     * @return The IDs of these sidebars.
     */
    showMultiple(mult : SidebarModel[], replace = true) : number[] {        
        console.log(`Requested new Sidebars: [${mult.map(s => s.type).join(', ')}]`);
        
        // Ensure every type is known. This does not use `every`
        // but `forEach` with a side-effect because we wan't to
        // know the offending type.
        mult.forEach(e => {
            if (!this.isKnownType(e.type)) {
                throw new Error(`Unknown sidebar type: ${e.type}`);
            }
        });

        // Assign the Id to each model
        let internal : InternalSidebarModel[] = mult.map(m => {
            return ({
                id : ++SidebarService._idCounter,
                type : m.type,
                param : m.param,
                sticky : !!m.sticky
            });
        });

        // If the existing model shouldn't be replaced, it needs to
        // be appended to the new model.
        if (!replace) {
            internal = internal.concat(this._model.getValue());
        }

        // Kick off the rendering by placing a new value in the observable
        this._model.next(internal);

        return (internal.map(m => m.id));
    }

    /**
     * Hides a single sidebar.
     */
    hideById(id : number) {
        const model = this._model.getValue();
        const index = model.findIndex(v => v.id === id);

        if (index < 0) {
            throw new Error(`Could not remove sidebar, unknown id "${id}"`);
        }

        // Don't splice here, we need a fresh reference
        this._model.next(model.filter((v,i) => i != index));
    }

    /**
     * Hides all sidebars that are not sticky.
     */
    hideNonSticky() {
        const model = this._model.getValue();

        // Put a changed array back into the observable
        this._model.next(model.filter((v) => v.sticky));
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
    get sidebarModel() : Observable<InternalSidebarModel[]> {
        return (this._model);
    }
}

/**
 * Denotes a sidebar component that should be rendered.
 */
export interface SidebarModel {
    // The sidebar-type-id to show
    type : string
    // The parameter to pass to the sidebar
    param? : any
    // True, if the sidebar should usually be displayed.
    sticky? : boolean
}

/**
 * The internally stored representation is extended with
 * an id.
 */
export interface InternalSidebarModel extends SidebarModel {
    id : number
}
