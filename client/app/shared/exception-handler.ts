import {Injectable, ErrorHandler}                     from '@angular/core'

import {FlashService}                                 from './flash.service'

declare var Notification : any;

// This file is an attempt to somehow get hold of exceptions that
// occur. But at the moment it doesn't seem that there is a
// straightforward way to only extend the default behaviour, not
// replace it. See https://github.com/angular/angular/issues/6865

// class _ArrayLogger {
//     res : any[] = [];
//     log(s: any): void { this.res.push(s); }
//     logError(s: any): void { this.res.push(s); }
//     logGroup(s: any): void { this.res.push(s); }
//     logGroupEnd() {
//         this.res.forEach(error => {
//             console.error(error);
//         })
//     };
// }

/**
 * Stores exceptions and attempts to show them via the flash service.
 */
// export class EsqulinoExceptionHandler extends ErrorHandler {

//     constructor(/*private _flashService : FlashService*/) {
//         super(new _ArrayLogger(), true);
//     }

//     call(exception : any, stackTrace? : any, reason? : string) {
//         super.call(exception, stackTrace, reason);

//         const msg = "Internal Error, check the console!";
        
//         if (Notification.permission === "granted") {
//             // If it's okay let's create a notification
//             var notification = new Notification(msg);
//         }

//         // Otherwise, we need to ask the user for permission
//         else if (Notification.permission !== 'denied') {
//             Notification.requestPermission(function (permission : string) {
//                 // If the user accepts, let's create a notification
//                 if (permission === "granted") {
//                     var notification = new Notification(msg);
//                 }
//             });
//         }
//     }
// }
