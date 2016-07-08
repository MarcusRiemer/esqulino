describe('Editor', () => {
    const testProjectId = "test";
    const editorUrl = `/editor/${testProjectId}/`;

    const someNoSidebarLink = element(by.css("ul.nav:nth-child(1) > li:nth-child(1) > a:nth-child(1)"));
    
    const someQueryLink = element(by.css(".nav-query")).all(by.css("a.nav-link")).first();
    const somePageLink = element(by.css(".nav-page")).all(by.css("a.nav-link")).first();

    const sidebarContainer = element(by.css("div.sidebar"));

    const msgErrPresent = "Sidebar shouldn't be present";
    const msgErrMissing = "Sidebar should be present";
    
    it(`doesn't break when navigation toggles the sidebar visibility`, () => {
        // We start with a page that does not have a sidebar
        browser.get(editorUrl)
            .then( () => expect(sidebarContainer.isPresent()).toBeFalsy(`1: ${msgErrPresent}`))
        // Navigate to a QueryEditor (it has a sidebar)
            .then( () => someQueryLink.click())
            .then( () => browser.waitForAngular() )
            .then( () => expect(sidebarContainer.isPresent()).toBeTruthy(`2: ${msgErrMissing}`))
        // Navigate back to a page without a sidebar
            .then( () => someNoSidebarLink.click())
            .then( () => browser.waitForAngular() )
            .then( () => expect(sidebarContainer.isPresent()).toBeFalsy(`3: ${msgErrPresent}`))
        // Navigate to a PageEditor (which also has a sidebar)
            .then( () => somePageLink.click() )
            .then( () => browser.waitForAngular() )
            .then( () => expect(sidebarContainer.isPresent()).toBeTruthy(`4: ${msgErrMissing}`))
        ;
    });
});
