import * as Model                from '../description'
import * as SyntaxTree           from '../syntaxtree'

describe('DELETE', () => {
    it('only case', () => {
        const model : Model.Delete = {
        }

        const w = new SyntaxTree.Delete(model, null);

        expect(w.toSqlString()).toEqual("DELETE");
        expect(w.toModel()).toEqual(model);
    });
});
