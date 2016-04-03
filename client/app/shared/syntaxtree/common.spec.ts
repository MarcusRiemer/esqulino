import * as SyntaxTree from './common'

describe('DataType', () => {
    it('serialisation', () => {
        expect(SyntaxTree.parseDataType("INTEGER")).toBe(SyntaxTree.DataType.Integer);
        expect(SyntaxTree.parseDataType("REAL")).toBe(SyntaxTree.DataType.Real);
        expect(SyntaxTree.parseDataType("TEXT")).toBe(SyntaxTree.DataType.Text);
    });

    it('deserialisation', () => {
        expect(SyntaxTree.serializeDataType(SyntaxTree.DataType.Integer)).toEqual("INTEGER");
        expect(SyntaxTree.serializeDataType(SyntaxTree.DataType.Real)).toEqual("REAL");
        expect(SyntaxTree.serializeDataType(SyntaxTree.DataType.Text)).toEqual("TEXT");
    });
});
