import {QueryReference, QueryReferenceDescription}   from './value-reference'

describe('QueryReference', () => {

    it('With empty reference', () => {
        const m : QueryReferenceDescription = {
            type : "query"
        }

        let q = new QueryReference(undefined, undefined, m);
        expect(q.isResolveable).toEqual(false, "Mustn't be resolveable!");
        expect(q.hasColumns).toEqual(false, "Has no columns!");
        expect(q.columns).toEqual([])
        expect(q.mapping).toEqual([], "Mustn't have a mapping");
        expect(q.toModel()).toEqual(m);
    });

});
