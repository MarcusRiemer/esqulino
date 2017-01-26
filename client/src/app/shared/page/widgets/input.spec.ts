import {Input, InputDescription}    from './input'

describe('Page Inputs', () => {
    it('Serialization', () => {
        const m : InputDescription = {
            type : "input",
            outParamName : "test",
            caption : "Caption",
            description : "Description",
            inputType : "text"
        }

        let c = new Input(m);
        expect(c.toModel()).toEqual(m);
    });
});

