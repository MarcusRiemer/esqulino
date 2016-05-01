import {Model}         from '../query'
import * as SyntaxTree from './where'

describe('WHERE', () => {
    it('with a constant truthy value', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            }
        }

        const w = new SyntaxTree.Where(model, null);

        expect(w.subsequent.length).toEqual(0);
        expect(w.toString()).toEqual("WHERE 1");
        expect(w.toModel()).toEqual(model);
    });

    it('with two epxressions', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            },
            following : [
                {
                    expr : { constant : { type: "INTEGER", value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);

        expect(w.subsequent.length).toEqual(1);
        expect(w.toString()).toEqual("WHERE 1\n\tOR 2");
        expect(w.toModel()).toEqual(model);
    });

    it('removing first', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            },
            following : [
                {
                    expr : { constant : { type: "INTEGER", value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);

        w.removeChild(w.first);

        expect(w.subsequent.length).toEqual(0);
        expect(w.toString()).toEqual("WHERE 2");
    });

    it('removing first subsequent', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            },
            following : [
                {
                    expr : { constant : { type: "INTEGER", value : "2" } },
                    logical : "OR"
                }
            ]
        }

        const w = new SyntaxTree.Where(model, null);

        w.subsequent[0].removeSelf();

        expect(w.subsequent.length).toEqual(0);
        expect(w.toString()).toEqual("WHERE 1");
    });

    it('adding a third condition', () => {
        const model : Model.Where = {
            first : {
                constant : { type : "INTEGER", value : "1" }
            },
            following : [
                {
                    expr : { constant : { type: "INTEGER", value : "2" } },
                    logical : "OR"
                }
            ]
        }

        let w = new SyntaxTree.Where(model, null);
        w.appendExpression({ constant : { type : "INTEGER", value : "3" } }, "OR");

        expect(w.subsequent.length).toEqual(2);
        expect(w.toString()).toEqual("WHERE 1\n\tOR 2\n\tOR 3");
    });
});
