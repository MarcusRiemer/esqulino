import {Model}         from '../query'
import * as SyntaxTree from './from'


describe('INNER JOIN', () => {
    it('Invalid: ON and USING', () => {
        // Model should be valid as far as the isolated syntax of both
        // parts is concerned
        const model : Model.Join = {
            table : { name : "tmp" },
            inner : {
                on : {
                    binary : {
                        lhs : { singleColumn : { column : "name", table : "person" } },
                        rhs : { singleColumn : { column : "name", table : "stadt" } },
                        operator : "<>",
                        simple : true
                    }
                },
                using : "tmp"
            }
        }

        expect( () => { new SyntaxTree.InnerJoin(null, model) }).toThrow();
    });
});

describe('FROM', () => {
    it('with a single table', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "pe"
            }
        };
        
        let f = new SyntaxTree.From(model)

        expect(f.first.name).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");

        expect(f.toString()).toEqual("FROM person pe");
        expect(f.toModel()).toEqual(model);
    });

    it('with a two table comma join', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "pe"
            },
            joins : [
                { table : { name : "ort" }, cross : "comma" }
            ]
        };
        
        let f = new SyntaxTree.From(model)

        expect(f.first.name).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");
        
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual(",");
        
        expect(f.toString()).toEqual("FROM person pe\n\t, ort");
        expect(f.toModel()).toEqual(model);
    });

    it('with a two table cross join', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "pe"
            },
            joins : [
                { table : { name : "ort" }, cross : "cross" }
            ]
        };
        
        let f = new SyntaxTree.From(model)

        expect(f.first.name).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual("JOIN");

        expect(f.toString()).toEqual("FROM person pe\n\tJOIN ort");
        expect(f.toModel()).toEqual(model);
    });

    it('with a two table INNER JOIN', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "pe"
            },
            joins : [
                {
                    table : {
                        name : "ort"
                    },
                    inner : {
                        using : "bla"
                    }
                }
            ]
        };

        let f = new SyntaxTree.From(model)

        expect(f.first.name).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");
        
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");

        expect(f.toString()).toEqual("FROM person pe\n\tINNER JOIN ort USING(bla)");
        expect(f.toModel()).toEqual(model);
    });

    it('removal of initial join', () => {
        const model : Model.From = {
            first : { name : "first" },
            joins : [
                {
                    cross: "cross",
                    table: { "name" : "second" }
                }
            ]
        };

        let f = new SyntaxTree.From(model);
        f.removeJoin(f.first);

        expect(f.numberOfJoins).toEqual(0);
        expect(f.first.toModel().table).toEqual(model.joins[0].table);
    });

    it('invalid removal of only join', () => {
        const model : Model.From = {
            first : { name : "first" },
            joins : []
        };

        let f = new SyntaxTree.From(model);
        expect( () => f.removeJoin(f.first)).toThrow();
    });

    it('removal of subsequent join', () => {
        const model : Model.From = {
            first : { name : "first" },
            joins : [
                {
                    cross: "cross",
                    table: { "name" : "second" }
                }
            ]
        };

        let f = new SyntaxTree.From(model);
        f.removeJoin(f.getJoin(0));

        expect(f.numberOfJoins).toEqual(0);
        expect(f.first.toModel().table).toEqual(model.first);
    });
});

