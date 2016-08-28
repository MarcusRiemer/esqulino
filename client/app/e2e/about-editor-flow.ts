describe('Navigation: Project List Page -> Editor', () => {
    const projectNames = ['events', 'cyoa', 'pokemongo', 'test', 'blog'];
    
    let projectNameInput = element(by.id("project-name"));

    let linkNavigateHome = element(by.id("navbar-navigate-home"));
    let linkNavigateProjects = element(by.id("navbar-navigate-projects"));

    const flashMessage = element(by.css("flash-message-list .alert"));

    /**
     * Clicks all projects that are listed in the `projectNames` variable
     * above.
     */
    function clickAllProjects() {
        let previousName : string = undefined;
        
        linkNavigateProjects.click()
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
    }

    it('Regression: Navigating to a different project does not reload it', () => {        
        // Initial navigation is clean
        browser.get('/')
            .then(clickAllProjects);
    });

    it('Error Handling: Navigating to a nonexistant project', () => {
        const invalidProjectId = "undefined";

        // Initial navigation is an error
        browser.get(`/editor/${invalidProjectId}`)
            .then( () => browser.waitForAngular() )
            .then( () => {
                expect(browser.getCurrentUrl()).toContain("/about/projects");
                expect(flashMessage.getText()).toContain(invalidProjectId);
            })
            .then(clickAllProjects);
    });
});
