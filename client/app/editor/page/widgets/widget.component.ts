export class WidgetComponent<TModel> {
    private _model : TModel;

    constructor(model : TModel) {
        this._model = model;
    }

    get model() {
        return (this._model);
    }

    set model(value : TModel) {
        this._model = value;
    }
}
