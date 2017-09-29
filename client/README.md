# BlattWerkzeug Client

An Angular 4 app that uses Typescript, because it is really nice to have a compiler that catches dumb errors. The app is broken up into several logical modules:

    AppModule                  Holds together the whole client
    ├─ SharedModule            Globally required functionality like icons
    ├─ FrontModule             Mainly text-pages that describe BlattWerkzeug
    └─ EditorModule            Bundles the actual editing capatabilities
       ├─ SharedEditorModule   Shared functionality like the sidebar
       ├─ ImageEditorModule    Upload and edit images
       ├─ PageEditorModule     The page editor
       └─ QueryEditorModule    The query editor
       
The `Makefile` requires the `npm` program to be available, dependencies are provided via the `package.json`. The `Makefile` will install required programs like the Typescript compiler `tsc` or the Angular ahead-of-time compiler `ngc` as part of the `install-deps` step.
