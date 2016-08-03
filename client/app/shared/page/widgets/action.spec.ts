import {
    NavigateAction, NavigateActionDescription,
    QueryAction, QueryActionDescription
} from './action'

describe('Page NavigateAction', () => {
    it ('Serialization with internal reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            internal : {
                pageId : "12",
                parameters : []
            }
        }

        let a = new NavigateAction(m, undefined);
        expect(a.isInternal).toEqual(true);
        expect(a.isExternal).toEqual(false);
        expect(a.toModel()).toEqual(m);
    });

    it ('Serialization with external reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/the-inner-json-effect"
        }

        let a = new NavigateAction(m, undefined);
        expect(a.isInternal).toEqual(false);
        expect(a.isExternal).toEqual(true);
        expect(a.toModel()).toEqual(m);
    });

    it('Invalid: Action with internal and external reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/the-inner-json-effect",
            internal : {
                pageId : "13",
                parameters : []
            }
        }

        expect( () => new NavigateAction(m, undefined)).toThrowError();
    });

    it('Changes type when switching between internal and external', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/the-inner-json-effect"
        }

        // Start with an external action
        let a = new NavigateAction(m, undefined);
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);

        // Stay external
        a.externalUrl = "http://elsewhere";
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);

        // Go internal
        a.internalPageId = "123";
        expect(a.isExternal).toEqual(false);
        expect(a.isInternal).toEqual(true);

        // Stay internal
        a.internalPageId = "1234";
        expect(a.isExternal).toEqual(false);
        expect(a.isInternal).toEqual(true);

        // Go external
        a.externalUrl = "http://elsewhere";
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);
    })
});
