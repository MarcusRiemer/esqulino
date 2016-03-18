import {Query, Model, SyntaxTree} from './query'
import {Column, Table}            from './table'

let schema : Table[] =
    [
        {
            "name": "ereignis",
            "columns": [
                {
                    "index": 0,
                    "name": "ereignis_id",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": true
                },
                {
                    "index": 1,
                    "name": "bezeichnung",
                    "type": "TEXT",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                },
                {
                    "index": 2,
                    "name": "beginn",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                },
                {
                    "index": 3,
                    "name": "ende",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                }
            ]
        },
        {
            "name": "person",
            "columns": [
                {
                    "index": 0,
                    "name": "person_id",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": true
                },
                {
                    "index": 1,
                    "name": "name",
                    "type": "TEXT",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                },
                {
                    "index": 2,
                    "name": "geb_dat",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                }
            ]
        }
    ];

describe('ColumnExpression', () => {
    it('with only a name', () => {
        const model = {
            column : "name"
        };
        
        let c = new SyntaxTree.ColumnExpression(model);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeFalsy();
        
        expect(c.toString()).toEqual("name");
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name and table', () => {
        const model = {
            column : "name",
            table : "person"
        };
        
        let c = new SyntaxTree.ColumnExpression(model);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("person");
        
        expect(c.toString()).toEqual("person.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name, table and table alias', () => {
        const model = {
            column : "name",
            table : "person",
            alias : "p"
        };
        
        let c = new SyntaxTree.ColumnExpression(model);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("p");
        
        expect(c.toString()).toEqual("p.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });
});

describe('SimpleCompareExpression', () => {
    it('with two columns', () => {
        const model = {
            lhs : { singleColumn : { column : "name", table : "person" } },
            rhs : { singleColumn : { column : "name", table : "stadt" } },
            operator : "<>",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model);

        expect(e.operator).toEqual("<>");
        let lhs = <SyntaxTree.ColumnExpression> e.lhs;
        let rhs = <SyntaxTree.ColumnExpression> e.rhs;

        expect(lhs.columnName).toEqual("name");
        expect(lhs.tableQualifier).toEqual("person");

        expect(rhs.columnName).toEqual("name");
        expect(rhs.tableQualifier).toEqual("stadt");

        expect(e.toString()).toEqual("person.name <> stadt.name");
        expect(e.toModel()).toEqual(model);
    });
});


describe('SELECT', () => {
    it('with three simple columns', () => {
        const model = {
            columns : [
                { expr : { singleColumn : {column : "id", table : "person", alias : "p" } } },
                { expr : { singleColumn : {column : "name" , table : "person" } } },
                { expr : { singleColumn : {column : "alter" , table : "person" } }, as : "dasAlter" }
            ]};
        
        const s = new SyntaxTree.Select(model);

        // Grand picture
        expect(s.numberOfColumns).toEqual(3);

        // Alias names
        expect(s.getAlias(0)).toBeUndefined();
        expect(s.getAlias(1)).toBeUndefined();
        expect(s.getAlias(2)).toEqual("dasAlter");

        // Details of those columns
        const col0 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col0.tableQualifier).toEqual("p");
        expect(col0.columnName).toEqual("id");

        const col1 = <SyntaxTree.ColumnExpression> s.getColumn(1);
        expect(col1.tableQualifier).toEqual("person");
        expect(col1.columnName).toEqual("name");

        const col2 = <SyntaxTree.ColumnExpression> s.getColumn(2);
        expect(col2.tableQualifier).toEqual("person");
        expect(col2.columnName).toEqual("alter");

        // Model and String serialization
        expect(s.toString()).toBe('SELECT p.id, person.name, person.alter AS dasAlter');
        expect(s.toModel()).toEqual(model);
    });
});


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

        expect( () => { new SyntaxTree.InnerJoin(model) }).toThrow();
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
        const model = {
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
        const model = {
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
        const model = {
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
    
});

describe('Query', () => {
    it ('Whole Query', () => {
        const model : Model.Query = {
            name : 'test-whole',
            id : 'id',
            select : {
                columns : [
                    { expr : { singleColumn : {column : "id", table : "person" } } },
                    { expr : {singleColumn : {column : "name" , table : "person" } } }
                ]
            },

            from : {
                first : {
                    name : "person"
                },
                joins : [
                    {
                        table : {
                            name : "ort",
                            alias  : "o"
                        },
                        cross : "cross"
                    }
                ]
            }
        };

        let q = new Query(schema, model);
        expect(q.name).toEqual("test-whole");
        expect(q.id).toEqual("id");

        expect(q.select.numberOfColumns).toEqual(2);
        expect(q.from.numberOfJoins).toEqual(1);

        expect(q.toSqlString()).toEqual("SELECT person.id, person.name\nFROM person\n\tJOIN ort o");
        expect(q.toModel()).toEqual(model);
    });

});
