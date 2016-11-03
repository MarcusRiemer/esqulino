import {Routes, RouterModule}           from '@angular/router'

export const schemaEditorRoutes : Routes = [
    {
        path: "",
        //component : ,
        children : [
            {},
            {}
        ]
    }
]

export const schemaEditorRouting = RouterModule.forChild(schemaEditorRoutes);
