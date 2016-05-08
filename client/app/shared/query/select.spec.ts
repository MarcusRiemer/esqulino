import {Schema}                  from '../schema'
import {Model, SyntaxTree}       from '../query'

import {QuerySelect}             from './select'

let schema  = new Schema([
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
                "name": "personId",
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
                "name": "gebDat",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            }
        ]
    }
]);

describe('Valid SELECT Queries', () => {
    it ('SELECT person.personId, person.name FROM person JOIN ort o', () => {
        let model : Model.QueryDescription = {
            name : 'test-whole',
            id : 'id',
            select : {
                columns : [
                    { expr : { singleColumn : {column : "personId", table : "person" } } },
                    { expr : { singleColumn : {column : "name" , table : "person" } } }
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
                            alias : "o"
                        },
                        cross : "cross"
                    }
                ]}

        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("test-whole");
        expect(q.id).toEqual("id");

        // SELECT
        expect(q.select.actualNumberOfColumns).toEqual(2);
        expect(q.select.columns.length).toEqual(2);

        const columns = q.select.actualColums;
        expect(columns.length).toEqual(2);
        expect(columns[0].name).toEqual("person.personId");
        expect(columns[1].name).toEqual("person.name");
        
        
        // FROM
        expect(q.from.numberOfJoins).toEqual(1);

        expect(q.toSqlString()).toEqual("SELECT person.personId, person.name\nFROM person\n\tJOIN ort o");
        expect(q.toModel()).toEqual(model);
    });
    
    it ('SELECT * FROM person WHERE 1', () => {
        const model : Model.QueryDescription = {
            name : 'where-simple',
            id : 'where-1',
            select : {
                columns : [{ expr : { star : { } } }]
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    constant : { type : "INTEGER", value : "1" }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-simple");
        expect(q.id).toEqual("where-1");

        // SELECT
        const columns = q.select.actualColums;
        expect(columns.length).toEqual(3);
        expect(columns[0].name).toEqual("person.personId");
        expect(columns[1].name).toEqual("person.name");
        expect(columns[2].name).toEqual("person.gebDat");
        
        // FROM
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1");
        expect(q.toModel()).toEqual(model);
    });

    it ('SELECT * FROM person WHERE 1 <= 2', () => {
        const model : Model.QueryDescription = {
            name : 'where-compare',
            id : 'where-2',
            select : {
                columns : [{ expr : { star : { } } }]
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    binary : {
                        lhs : { constant : { type : "INTEGER", value : "1" } },
                        rhs : { constant : { type : "INTEGER", value : "2" } },
                        operator : "<=",
                        simple : true
                    }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-compare");
        expect(q.id).toEqual("where-2");

        expect(q.select.actualNumberOfColumns).toEqual(3);
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1 <= 2");
        expect(q.toModel()).toEqual(model);
    });

});

describe('Invalid SELECT Queries', () => {
    it ('Unknown column: SELECT person.nonexistant FROM person', () => {
        const model : Model.QueryDescription = {
            name : 'select-nonexistant-column',
            id : 'invalid-select-1',
            select : {
                columns : [
                    { expr : { singleColumn : {column : "nonexistant", table : "person" } } },
                ]
            },
            from : {
                first : {
                    name : "person"
                }
            }
        };

        let q = new QuerySelect(schema, model);

        expect(q.toModel()).toEqual(model);
        expect(q.validate().isValid).toBeFalsy();
    });
});
