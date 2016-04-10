import {Model}         from '../query.model'
import * as SyntaxTree from './delete'

describe('DELETE', () => {
    it('only case', () => {
        const model : Model.Delete = {
        }

        const w = new SyntaxTree.Delete(model);

        expect(w.toString()).toEqual("DELETE");
        expect(w.toModel()).toEqual(model);
    });
});
