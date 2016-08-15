import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import AppModule                  from './app.module'

// Load rxjs as a whole, in case this is not a bundled build
import 'rxjs/Rx'

platformBrowserDynamic().bootstrapModule(AppModule);
