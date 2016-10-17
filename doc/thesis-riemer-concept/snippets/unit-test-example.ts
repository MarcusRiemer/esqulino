// Datamodel for "SELECT * FROM person WHERE 1"
// Table "person":
//   - Primary Key "personId", int
//   - Column "name", string
//   - Column "gebDat", int
const model : Model.QueryDescription = {
    name : 'where-simple',
    id : 'where-1',
    apiVersion : CURRENT_API_VERSION,
    select : { columns : [{ expr : { star : { } } }] },
    from : { first : { name : "person" } },
    where : { first : { constant : { value : "1" } } }
};
let q = new QuerySelect(schema, model);

// SELECT, star needs to be expanded according to the model
expect(q.select.actualColums).toEqual(3);

// FROM, has no joins at all
expect(q.from.numberOfJoins).toEqual(0);

// Serialization to SQL and the internal model
expect(q.toSqlString()).toEqual('SELECT *\nFROM person\nWHERE 1');
expect(q.toModel()).toEqual(model);
