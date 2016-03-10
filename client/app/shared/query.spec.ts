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
        let c = new SyntaxTree.ColumnExpression({
            single : {
                column : "name"
            }
        });

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeFalsy();
        expect(c.toString()).toEqual("name");
    });

    it('with name and table', () => {
        let c = new SyntaxTree.ColumnExpression({
            single : {
                column : "name",
                table : "person"
            }
        });

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("person");
        expect(c.toString()).toEqual("person.name");
    });

    it('with name, table and table alias', () => {
        let c = new SyntaxTree.ColumnExpression({
            single : {
                column : "name",
                table : "person",
                alias : "p"
            }
        });

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("p");
        expect(c.toString()).toEqual("p.name");
    });
});


describe('SELECT', () => {
    it('with three simple columns', () => {
        let s = new SyntaxTree.Select({
            columns : [
                { single : {column : "id", table : "person", alias : "p" } },
                { single : {column : "name" , table : "person" } },
                { single : {column : "alter" , table : "person" }, as : "dasAlter" }
            ]});

        // Grand picture
        expect(s.numberOfColumns).toEqual(3);

        // Alias names
        expect(s.getAlias(0)).toBeUndefined();
        expect(s.getAlias(1)).toBeUndefined();
        expect(s.getAlias(2)).toEqual("dasAlter");

        // Details of those columns
        let col0 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col0.tableQualifier).toEqual("p");
        expect(col0.columnName).toEqual("id");

        let col1 = <SyntaxTree.ColumnExpression> s.getColumn(1);
        expect(col1.tableQualifier).toEqual("person");
        expect(col1.columnName).toEqual("name");

        let col2 = <SyntaxTree.ColumnExpression> s.getColumn(2);
        expect(col2.tableQualifier).toEqual("person");
        expect(col2.columnName).toEqual("alter");

        expect(s.toString()).toBe('SELECT p.id, person.name, person.alter AS dasAlter');

    });
});

describe('FROM', () => {
    it('with a single table', () => {
        let f = new SyntaxTree.From({
            table : "person",
            alias : "pe"
        })

        expect(f.initial.name).toEqual("person");
        expect(f.initial.alias).toEqual("pe");
        expect(f.initial.nameWithAlias).toEqual("person pe");
        expect(f.toString()).toEqual("FROM person pe");
    });

    it('with a two table comma join', () => {
        let f = new SyntaxTree.From({
            table : "person",
            alias : "pe",
            joins : [
                { table : "ort", cross : "comma" }
            ]
        })

        expect(f.initial.name).toEqual("person");
        expect(f.initial.alias).toEqual("pe");
        expect(f.initial.nameWithAlias).toEqual("person pe");
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual(",");
        expect(f.toString()).toEqual("FROM person pe\n\t, ort");
    });

    it('with a two table cross join', () => {
        let f = new SyntaxTree.From({
            table : "person",
            alias : "pe",
            joins : [
                { table : "ort", cross : "cross" }
            ]
        })

        expect(f.initial.name).toEqual("person");
        expect(f.initial.alias).toEqual("pe");
        expect(f.initial.nameWithAlias).toEqual("person pe");
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");
        expect(f.getJoin(0).sqlJoinKeyword).toEqual("JOIN");

        expect(f.toString()).toEqual("FROM person pe\n\tJOIN ort");
    });

    it('with a two table INNER JOIN', () => {
        let f = new SyntaxTree.From({
            table : "person",
            alias : "pe",
            joins : [
                { table : "ort",
                  inner : {
                      method : "using",
                      expr : { singleColumn : "bla" }
                  }
                }
            ]
        })

        expect(f.initial.name).toEqual("person");
        expect(f.initial.alias).toEqual("pe");
        expect(f.initial.nameWithAlias).toEqual("person pe");
        expect(f.getJoin(0).name).toEqual("ort");
        expect(f.getJoin(0).nameWithAlias).toEqual("ort");

        expect(f.toString()).toEqual("FROM person pe\n\tINNER JOIN ort USING(bla)");
    });
    
});

describe('Query', () => {
    it ('Whole Query', () => {
        let model : Model.Query = {
            name : 'test-whole',
            id : 'id',
            select : {
                columns : [
                    { single : {column : "id", table : "person" } },
                    { single : {column : "name" , table : "person" } }
                ]
            },

            from : { table : "person",
                     joins : [
                         { table : "ort",
                           alias  : "o",
                           cross : "cross"
                         }
                     ]}

        };

        let q = new Query(schema, model);
        expect(q.name).toEqual("test-whole");
        expect(q.id).toEqual("id");

        expect(q.select.numberOfColumns).toEqual(2);
        expect(q.from.numberOfJoins).toEqual(1);

        expect(q.toSqlString()).toEqual("SELECT person.id, person.name\nFROM person\n\tJOIN ort o");
    });

});
