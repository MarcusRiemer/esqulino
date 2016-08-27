describe('Navigation: Project List Page -> Editor', () => {
    const projectNames = ['events', 'cyoa', 'pokemongo', 'test', 'blog'];
    
    let projectNameInput = element(by.id("project-name"));

    let linkNavigateHome = element(by.id("navbar-navigate-home"));
    let linkNavigateProjects = element(by.id("navbar-navigate-projects"));



    it('Regression: Navigating to a different project does not reload it', () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

        let previousName : string = undefined;
        
        // Initial navigation
        browser.get('/')
            .then( () => linkNavigateProjects.click())
            .then( () => {
                // Ensure each link points to the correct editor
                projectNames.forEach(name => {
                    const selector = `#available-projects a.btn-edit-project[name=${name}]`;
                    let editButton = element(by.css(selector)).getWebElement();

                    // For some reason using "editButton.click()" directly doesnt work
                    browser.executeScript('arguments[0].click()', editButton); 
                    
                    browser.waitForAngular()
                        .then( () => projectNameInput.getAttribute('value'))
                        .then( (inputName) => {
                            expect(inputName).not.toEqual(previousName);
                            previousName = inputName;
                        })
                        .then( () => linkNavigateHome.click())
                        .then( () => linkNavigateProjects.click());
                });
            });
    });
});
