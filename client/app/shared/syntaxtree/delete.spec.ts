import {Model}         from '../query'
import * as SyntaxTree from './delete'

describe('DELETE', () => {
    it('only case', () => {
        const model : Model.Delete = {
        }

        const w = new SyntaxTree.Delete(model, null);

        expect(w.toSqlString()).toEqual("DELETE");
        expect(w.toModel()).toEqual(model);
    });
});
