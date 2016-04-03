import {Model}         from '../query.model'
import * as SyntaxTree from './where'

describe('WHERE', () => {
    it('with a constant truthy value', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            }
        }

        const w = new SyntaxTree.Where(model);

        expect(w.toString()).toEqual("WHERE 1");
        expect(w.toModel()).toEqual(model);
    });
});
