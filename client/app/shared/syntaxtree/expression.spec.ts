import {Model}         from '../query'
import * as SyntaxTree from './expression'

describe('DataType', () => {
    it('INTEGER', () => {
        expect(SyntaxTree.determineType("1")).toEqual(<Model.DataType>"INTEGER");
        expect(SyntaxTree.determineType("-1")).toEqual(<Model.DataType>"INTEGER");
        expect(SyntaxTree.determineType("100")).toEqual(<Model.DataType>"INTEGER");
    });

    it('REAL', () => {
        expect(SyntaxTree.determineType("1.")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType(".1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("1.1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-1.")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-.1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-1.1")).toEqual(<Model.DataType>"REAL");
    });
})

describe('MissingExpression', () => {
    it('Only case', () => {
        const model : Model.MissingExpression = {

        }

        const c = new SyntaxTree.MissingExpression(model, null);

        // Model and String serialization
        expect( () => { c.toString() }).toThrow()
        expect(c.toModel().missing).toEqual(model);
    });
});

describe('ConstantExpression', () => {
    it('Valid Integer', () => {
        const model : Model.ConstantExpression = {
            type : "INTEGER",
            value : "0"
        }

        const c = new SyntaxTree.ConstantExpression(model, null);

        // Model and String serialization
        expect(c.toString()).toEqual("0");
        expect(c.toModel().constant).toEqual(model);
    });

    it('Valid String', () => {
        const model : Model.ConstantExpression = {
            type : "TEXT",
            value : "0"
        }

        const c = new SyntaxTree.ConstantExpression(model, null);

        // Model and String serialization
        expect(c.toString()).toEqual(`"0"`);
        expect(c.toModel().constant).toEqual(model);
    });
});

describe('ParameterExpression', () => {
    it('Valid Key', () => {
        const model : Model.ParameterExpression = {
            key : "valid"
        }

        const c = new SyntaxTree.ParameterExpression(model, null);

        // Model and String serialization
        expect(c.toString()).toEqual(`@${model.key}`);
        expect(c.toModel().parameter).toEqual(model);
    });

    it('Invalid Key: empty string', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:""}, null) ).toThrow();
    });

    it('Invalid Key: contains space', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"v a l"}, null) ).toThrow();
    });
    
    it('Invalid Key: Begins with a number', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"1valid"}, null) ).toThrow();
    });

    it('Invalid Key: Begins with an underscore', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"_valid"}, null) ).toThrow();
    });
});


describe('ColumnExpression', () => {
    it('with only a name', () => {
        const model = {
            column : "name"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual(model.column);
        expect(c.hasTableQualifier).toBeFalsy();

        // Model and String serialization
        expect(c.toString()).toEqual(model.column);
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name and table', () => {
        const model = {
            column : "name",
            table : "person"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("person");

        // Model and String serialization
        expect(c.toString()).toEqual("person.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name, table and table alias', () => {
        const model = {
            column : "name",
            table : "person",
            alias : "p"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("p");

        // Model and String serialization
        expect(c.toString()).toEqual("p.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });
});

describe('BinaryExpression', () => {
    it('testing two columns for inequality', () => {
        const model = {
            lhs : { singleColumn : { column : "name", table : "person" } },
            rhs : { singleColumn : { column : "name", table : "stadt" } },
            operator : "<>",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("<>");
        let lhs = <SyntaxTree.ColumnExpression> e.lhs;
        let rhs = <SyntaxTree.ColumnExpression> e.rhs;

        expect(lhs.columnName).toEqual("name");
        expect(lhs.tableQualifier).toEqual("person");

        expect(rhs.columnName).toEqual("name");
        expect(rhs.tableQualifier).toEqual("stadt");

        // Model and String serialization
        expect(e.toString()).toEqual("person.name <> stadt.name");
        expect(e.toModel().binary).toEqual(model);
    });

    it('testing two integer constants for equality', () => {
        const strTypeInt = <Model.DataType>"INTEGER";
        
        const model = {
            lhs : { constant : { type : strTypeInt, value : "0" } },
            rhs : { constant : { type : strTypeInt, value : "1" } },
            operator : "=",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("=");
        let lhs = <SyntaxTree.ConstantExpression> e.lhs;
        let rhs = <SyntaxTree.ConstantExpression> e.rhs;

        expect(lhs.type).toEqual(<Model.DataType>"INTEGER");
        expect(lhs.value).toEqual("0");

        expect(rhs.type).toEqual(<Model.DataType>"INTEGER");
        expect(rhs.value).toEqual("1");
        
        // Model and String serialization
        expect(e.toString()).toEqual("0 = 1");
        expect(e.toModel().binary).toEqual(model);
    });

    it('testing two string constants with the LIKE operator', () => {
        const strTypeStr = <Model.DataType>"TEXT";
        
        const model = {
            lhs : { constant : { type : strTypeStr, value : "w a s d" } },
            rhs : { constant : { type : strTypeStr, value : "%a%" } },
            operator : "LIKE",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("LIKE");
        let lhs = <SyntaxTree.ConstantExpression> e.lhs;
        let rhs = <SyntaxTree.ConstantExpression> e.rhs;

        expect(lhs.type).toEqual(<Model.DataType>"TEXT");
        expect(lhs.value).toEqual("w a s d");

        expect(rhs.type).toEqual(<Model.DataType>"TEXT");
        expect(rhs.value).toEqual("%a%");
        
        // Model and String serialization
        expect(e.toString()).toEqual(`"w a s d" LIKE "%a%"`);
        expect(e.toModel().binary).toEqual(model);
    });

    it('replacing children', () => {
        const strTypeStr = <Model.DataType>"TEXT";
        
        const model = {
            lhs : { constant : { type : strTypeStr, value : "w a s d" } },
            rhs : { constant : { type : strTypeStr, value : "%a%" } },
            operator : "LIKE",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);
        const lhs = <SyntaxTree.ConstantExpression> e.lhs;
        const rhs = <SyntaxTree.ConstantExpression> e.rhs;

        const newLhs = new SyntaxTree.MissingExpression({}, null);
        const newRhs = new SyntaxTree.MissingExpression({}, null);

        e.replaceChild(lhs, newLhs);
        expect(e.lhs).toBe(newLhs);
        e.replaceChild(rhs, newRhs);
        expect(e.rhs).toBe(newRhs);
    });
});
