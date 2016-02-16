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

describe('SELECT', () => {
    it('with two simple columns', () => {
        let s = new SyntaxTree.Select({
            columns : [
                { simple : {column : "id", asName : "person_id" } },
                { simple : {column : "name", asName : "person_name" } }
            ]});

        expect(s.NumberOfColumns).toEqual(2);

        let col0 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col0.TableQualifier).toEqual("p");
        expect(col0.ColumnName).toEqual("id");

        let col1 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col1.TableQualifier).toEqual("p");
        expect(col1.ColumnName).toEqual("name");
        
    });
});

describe('Query', () => {
    it ('Whole Query', () => {
        let model : Model.Query = {
            select : {
                columns : [
                    { simple : {column : "id", asName : "person_id" } },
                    { simple : {column : "name", asName : "person_name" } }
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
