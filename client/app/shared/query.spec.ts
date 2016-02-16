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
    it('simple with only table', () => {
        let c = new SyntaxTree.ColumnExpression({
            single : {
                column : "name",
                table : "person"
            }
        });

        expect(c.ColumnName).toBe("name");
        expect(c.TableQualifier).toBe("person");
    });

    it('simple with table alias', () => {
        let c = new SyntaxTree.ColumnExpression({
            single : {
                column : "name",
                table : "person",
                alias : "p"
            }
        });

        expect(c.ColumnName).toBe("name");
        expect(c.TableQualifier).toBe("p");
    });
});


describe('SELECT', () => {
    it('with three simple columns', () => {
        let s = new SyntaxTree.Select({
            columns : [
                { single : {column : "id", table : "person", alias : "p" } },
                { single : {column : "name" , table : "person" } },
                { single : {column : "alter" , table : "person" }, as : "alter" }
            ]});

        expect(s.NumberOfColumns).toEqual(3);

        let col0 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col0.TableQualifier).toEqual("p");
        expect(col0.ColumnName).toEqual("id");

        let col1 = <SyntaxTree.ColumnExpression> s.getColumn(1);
        expect(col1.TableQualifier).toEqual("person");
        expect(col1.ColumnName).toEqual("name");

        expect(s.toString()).toBe('SELECT p.id, person.name, person.alter AS alter');
        
    });
});

describe('Query', () => {
    it ('Whole Query', () => {
        let model : Model.Query = {
            select : {
                columns : [
                    { single : {column : "id", table : "person" } },
                    { single : {column : "name" , table : "person" } }
                ]
            },

            from : { table : "person",
                     alias : "pe",
                     joins : [
                         { table : "ort",
                           alias  : "o",
                           type : "cross"
                         }
                     ]}
            
        };

        let q = new Query(schema, model);

        expect(q.Select.NumberOfColumns).toEqual(2);
    });

});
