import {Injectable, EventEmitter}         from '@angular/core'

import {BehaviorSubject}                  from 'rxjs/BehaviorSubject'
import {Observable}                       from 'rxjs/Observable'

/**
 * Controls the visual state of the trash icon.
 */
@Injectable()
export class TrashService {
    private _showTrash = new BehaviorSubject<boolean>(false);

    private _onDrop = new EventEmitter<DataTransfer>();

    /**
     * Shows the trash on the next view update. The given
     * callback is fired once something has been dropped
     * on the trash.
     */
    showTrash(callback : (data : DataTransfer) => void) {
        this._showTrash.next(true);

        if (callback) {
            this._onDrop = new EventEmitter<DataTransfer>();
            this._onDrop
                .first()
                .subscribe(callback);
        }
    }

    /**
     * Hides the trash on the next view update.
     */
    hideTrash() {
        this._showTrash.next(false);

        // Kill all subscriptions, if there are any
        if (this._onDrop) {
            this._onDrop = undefined;
        }
    }

    /**
     * Not for public use!
     */
    _fireDrop(transfer : DataTransfer) {
        if (this._onDrop) {
            this._onDrop.emit(transfer);
        }
        this.hideTrash();
    }

    /**
     * @return An observable that indicates whether the trash would be shown.
     */
    get isTrashShown() : Observable<boolean> {
        return (this._showTrash);
    }
}
