import { Injectable, Compiler, Injector, Type } from "@angular/core";

export type LoaderFunction = () => Promise<Type<unknown>>;

@Injectable({
  providedIn: "root",
})
export class DynamicModuleLoaderService {
  constructor(private _compiler: Compiler, private _injector: Injector) {}

  async loadModule(loaderFunction: LoaderFunction): Promise<void> {
    // Resolve the network request
    const loadedModuleClass = await loaderFunction();

    // Wrap the Angular magic around the raw module class
    const moduleFactory = await this._compiler.compileModuleAsync(
      loadedModuleClass
    );

    // Create that module, this will execute the constructor of
    // the module.
    moduleFactory.create(this._injector);
  }
}
