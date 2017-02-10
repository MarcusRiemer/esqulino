import {Schema, TableDescription}                from '../../schema'
import {Model, SyntaxTree}                       from '../base'

/**
 * Used to generate a schema that exactly matches a given model,
 * useful for tests that shouldn't be invalid
 *
 * @param model The model the schema will be extracted from.
 *
 * @return A schema matching the model
 */
function matchingTables(model : Model.From) {
    let tables : TableDescription[] = [
        {
            columns : [],
            foreign_keys: [],
            name : model.first.name
        }
    ];

    if (model.joins) {
        model.joins.forEach(j => tables.push({
            columns : [],
            foreign_keys: [],
            name : j.table.name
        }));
    }

    return (tables);
};

describe('INNER JOIN', () => {
    it('Error: Both ON and USING', () => {
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
        
        let f = new SyntaxTree.From(model, null)

        expect(f.first.tableName).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");

        expect(f.isProvidingAlias("pe")).toBeTruthy();
        expect(f.isUsingTable("person")).toBeTruthy();

        expect(f.toSqlString()).toEqual("FROM person pe");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
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
        
        let f = new SyntaxTree.From(model, null)

        expect(f.first.tableName).toEqual(model.first.name);
        expect(f.first.alias).toEqual(model.first.alias);
        expect(f.first.nameWithAlias).toEqual("person pe");
        
        expect(f.getJoin(0).tableName).toEqual(model.joins[0].table.name);
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual(",");

        expect(f.isProvidingAlias("pe")).toBeTruthy();
        expect(f.isProvidingAlias("ort")).toBeTruthy();
        expect(f.isUsingTable("person")).toBeTruthy();
        expect(f.isUsingTable("ort")).toBeTruthy();
        
        expect(f.toSqlString()).toEqual("FROM person pe\n\t, ort");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
    });

    it('with self comma join', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "lhs"
            },
            joins : [{
                table : {
                    name : "person",
                    alias : "rhs"
                }, cross : "comma"
            }]
        };
        
        let f = new SyntaxTree.From(model, null)

        expect(f.first.tableName).toEqual(model.first.name);
        expect(f.first.alias).toEqual(model.first.alias);
        expect(f.first.nameWithAlias).toEqual("person lhs");
        
        expect(f.getJoin(0).tableName).toEqual(model.joins[0].table.name);
        expect(f.getJoin(0).nameWithAlias).toEqual("person rhs");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual(",");
        
        expect(f.toSqlString()).toEqual("FROM person lhs\n\t, person rhs");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
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
        
        let f = new SyntaxTree.From(model, null)

        expect(f.first.tableName).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");
        expect(f.getJoin(0).tableName).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual("JOIN");

        expect(f.toSqlString()).toEqual("FROM person pe\n\tJOIN ort");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
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

        let f = new SyntaxTree.From(model, null)

        expect(f.first.tableName).toEqual("person");
        expect(f.first.alias).toEqual("pe");
        expect(f.first.nameWithAlias).toEqual("person pe");
        
        expect(f.getJoin(0).tableName).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");

        expect(f.toSqlString()).toEqual("FROM person pe\n\tINNER JOIN ort USING(bla)");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
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

        let f = new SyntaxTree.From(model, null);
        f.removeJoin(f.first);

        expect(f.numberOfJoins).toEqual(0);
        expect(f.first.toModel().table).toEqual(model.joins[0].table);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
    });

    it('changing the order of JOINs', () => {
        // To all future readers: Sorry, this test is confusing ... But it
        // does catch nasty errors.
        const model : Model.From = {
            first : { name : "first" },
            joins : [
                {
                    cross: "cross",
                    table: { "name" : "second" }
                },
                {
                    cross: "cross",
                    table: { "name" : "third" }
                }
            ]
        };

        let f = new SyntaxTree.From(model, null);
        
        f.moveJoin(f.getJoin(0), 2);

        expect(f.joinsAndInitial.map(j => j.tableName)).toEqual(["first", "third", "second"], "First move error");
        expect(f.first instanceof SyntaxTree.InitialJoin).toBeTruthy();
        expect(f.joins.every(j => j instanceof SyntaxTree.InitialJoin)).toBeFalsy();

        // Expected [ 'second', 'first', 'third' ] to equal [ 'third', 'first', 'second' ], 'Second move error'.
        
        f.moveJoin(f.getJoin(0), 0);
        expect(f.joinsAndInitial.map(j => j.tableName)).toEqual(["third", "first", "second"], "Second move error");
        expect(f.first instanceof SyntaxTree.InitialJoin).toBeTruthy();
        expect(f.joins.every(j => j instanceof SyntaxTree.InitialJoin)).toBeFalsy();
        
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

        let f = new SyntaxTree.From(model, null);
        f.removeJoin(f.getJoin(0));

        expect(f.numberOfJoins).toEqual(0);
        expect(f.first.toModel().table).toEqual(model.first);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(0);
    });

    it('Error: removal of only join', () => {
        const model : Model.From = {
            first : { name : "first" },
            joins : []
        };

        let f = new SyntaxTree.From(model, null);
        expect( () => f.removeJoin(f.first) ).toThrowError();
    });

    it('Invalid: Self-Join without alias', () => {
        const model : Model.From = {
            first : {
                name : "person"
            },
            joins : [{
                table : {
                    name : "person"
                }, cross : "comma"
            }]
        };
        
        let f = new SyntaxTree.From(model, null)

        // Basic serialization
        expect(f.toSqlString()).toEqual("FROM person\n\t, person");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(1);
        expect(v.getError(0).errorMessage).toContain(model.first.name);
    });

    it('Invalid: Join with duplicate alias', () => {
        const model : Model.From = {
            first : {
                name : "person",
                alias : "o"
            },
            joins : [{
                table : {
                    name : "ort",
                    alias : "o"
                }, cross : "comma"
            }]
        };
        
        let f = new SyntaxTree.From(model, null)

        // Basic serialization
        expect(f.toSqlString()).toEqual("FROM person o\n\t, ort o");
        expect(f.toModel()).toEqual(model);

        // Validity
        let v = f.validate(new Schema(matchingTables(model)));
        expect(v.numErrors).toEqual(1);
        expect(v.getError(0).errorMessage).toContain(model.first.alias);
    });
});

