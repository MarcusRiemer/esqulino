import {TableDescription}     from './schema'
import {Schema}               from './schema'

let schemaModel : TableDescription[] = [
    {
        "name": "ereignis",
        "columns": [
            {
                "index": 0,
                "name": "ereignis_id",
                "type": "INTEGER",
                "not_null": true,
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

describe('Schema', () => {
    it ('Accessing an existing table', () => {
        let s = new Schema(schemaModel);

        expect(s.getTable("person")).toBeTruthy();
        expect(s.getTable("ereignis")).toBeTruthy();
    });

});
