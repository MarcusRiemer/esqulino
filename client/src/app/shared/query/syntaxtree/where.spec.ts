import * as Model                                from '../description'
import * as SyntaxTree                           from '../syntaxtree'

describe('WHERE', () => {
    it('with a constant truthy value', () => {
        const model : Model.Where = {
            first : {
                constant : { value : "1" }
            }
        }

        const w = new SyntaxTree.Where(model, null);

        expect(w.subsequent.length).toEqual(0);
        expect(w.toSqlString()).toEqual("WHERE 1");
        expect(w.toModel()).toEqual(model);
    });

    it('with two epxressions', () => {
        const model : Model.Where = {
            first : {
                constant : { value : "1" }
            },
            following : [
                {
                    expr : { constant : { value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);

        expect(w.subsequent.length).toEqual(1);
        expect(w.toSqlString()).toEqual("WHERE 1\n\tOR 2");
        expect(w.toModel()).toEqual(model);
    });

    it('removing first', () => {
        const model : Model.Where = {
            first : {
                constant : { value : "1" }
            },
            following : [
                {
                    expr : { constant : { value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);

        let hasChanged = false;
        w.modelChanged.subscribe(_ => hasChanged = true);

        w.removeChild(w.first);

        expect(w.subsequent.length).toEqual(0);
        expect(w.toSqlString()).toEqual("WHERE 2");

        expect(hasChanged).toEqual(true, "Change not fired");
    });

    it('removing first subsequent', () => {
        const model : Model.Where = {
            first : {
                constant : { value : "1" }
            },
            following : [
                {
                    expr : { constant : { value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);
        
        let hasChanged = false;
        w.modelChanged.subscribe(_ => hasChanged = true);

        w.subsequent[0].removeSelf();

        expect(w.subsequent.length).toEqual(0);
        expect(w.toSqlString()).toEqual("WHERE 1");
        expect(hasChanged).toEqual(true, "Change not fired");
    });

    it('adding a third condition', () => {
        const model : Model.Where = {
            first : {
                constant : { value : "1" }
            },
            following : [
                {
                    expr : { constant : { value : "2" } },
                    logical : "OR"
                }
            ]
        }

        let w = new SyntaxTree.Where(model, null);

        let hasChanged = false;
        w.modelChanged.subscribe(_ => hasChanged = true);
        
        w.appendExpression({ constant : { type : "INTEGER", value : "3" } }, "OR");

        expect(w.subsequent.length).toEqual(2);
        expect(w.toSqlString()).toEqual("WHERE 1\n\tOR 2\n\tOR 3");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});
