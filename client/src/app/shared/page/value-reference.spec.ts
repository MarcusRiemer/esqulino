import {QueryReference, QueryReferenceDescription}   from './value-reference'

describe('QueryReference', () => {

    it('Empty reference', () => {
        const m : QueryReferenceDescription = {
            type : "query"
        }

        let q = new QueryReference(undefined, m);
        expect(q.isResolveable).toEqual(false, "Mustn't be resolveable!");
        expect(q.hasColumns).toEqual(false, "Has no columns!");
        expect(q.columns).toEqual([])
        expect(q.mapping).toEqual([], "Mustn't have a mapping");
        expect(q.toModel()).toEqual(m);
    });

    it('Empty reference with mapping data', () => {
        const m : QueryReferenceDescription = {
            type : "query",
            mapping : [
                {
                    parameterName : "foo",
                    providingName : "get.bar"
                }
            ]
        }

        let q = new QueryReference(undefined, m);
        expect(q.isResolveable).toEqual(false, "Mustn't be resolveable!");
        expect(q.hasColumns).toEqual(false, "Has no columns!");
        expect(q.columns).toEqual([])
        expect(q.toModel()).toEqual(m);
    });

});
