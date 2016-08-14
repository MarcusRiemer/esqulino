import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule }              from './app.module'

// Add all operators to Observable
import 'rxjs/Rx'

platformBrowserDynamic().bootstrapModule(AppModule);
