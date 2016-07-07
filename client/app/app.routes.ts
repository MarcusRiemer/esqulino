import {
    provideRouter, RouterConfig
} from '@angular/router'

import {EditorRoutes}                   from './editor/editor.routes'
import {FrontRoutes}                    from './front/front.routes'

const routes : RouterConfig = [
    ...FrontRoutes,
    ...EditorRoutes,
]

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
]
