import {
    provideRouter, RouterConfig
} from '@angular/router'

import {EditorRoutes}                   from './editor/editor.routes'
import {FrontRoutes}                    from './front/front.routes'

export const routes : RouterConfig = [
    ...EditorRoutes,
    ...FrontRoutes,
]

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
]
