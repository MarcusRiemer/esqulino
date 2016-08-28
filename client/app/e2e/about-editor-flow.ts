describe('Navigation: Project List Page -> Editor', () => {
    const projectNames = ['events', 'cyoa', 'pokemongo', 'test', 'blog'];
    
    let projectNameInput = element(by.id("project-name"));

    let linkNavigateHome = element(by.id("navbar-navigate-home"));
    let linkNavigateProjects = element(by.id("navbar-navigate-projects"));

    let linkProjectFirstQuery = element(by.css(".nav-query > li:nth-child(3) > a:nth-child(1)"));

    const flashMessage = element(by.css("flash-message-list .alert"));

    /**
     * Clicks all projects that are listed in the `projectNames` variable
     * above.
     */
    function clickAllProjects() {
        let previousName : string = undefined;

        // Initially navigate to the project list
        linkNavigateProjects.click()
            .then( () => {
                // Ensure each link points to the correct editor
                projectNames.forEach(name => {
                    const selector = `#available-projects a.btn-edit-project[name=${name}]`;
                    let editButton = element(by.css(selector)).getWebElement();

                    // For some reason using "editButton.click()" directly doesnt work
                    browser.executeScript('arguments[0].click()', editButton)
                        .then( () => browser.waitForAngular())
                        .then( () => projectNameInput.getAttribute('value'))
                    // Ensure the name of the project does not equal the previous project
                        .then( (inputName) => {
                            expect(inputName).not.toEqual(previousName);
                            previousName = inputName;
                        })
                    // Navigate to a page with a sidebar because this has shown to
                    // trigger errors
                        .then( () => linkProjectFirstQuery.click())
                        .then( () => browser.waitForAngular())
                    // Navigate to the homepage via the esqulino logo
                        .then( () => linkNavigateHome.click())
                        .then( () => browser.waitForAngular())
                    // And then go to the project overview so things can start over again
                        .then( () => linkNavigateProjects.click())
                        .then( () => browser.waitForAngular())
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

    it('Error Handling: Navigating to a nonexistant page of an existing project', () => {
        const invalidPageId = "undefined";

        // Initial navigation is an error
        browser.get(`/editor/test/page/${invalidPageId}`)
            .then( () => browser.waitForAngular() )
            .then( () => {
                expect(browser.getCurrentUrl()).not.toContain("page");
                expect(browser.getCurrentUrl()).not.toContain(invalidPageId);
                expect(flashMessage.getText()).toContain(invalidPageId);
            });
    });

    it('Error Handling: Navigating to a nonexistant query of an existing project', () => {
        const invalidQueryId = "undefined";

        // Initial navigation is an error
        browser.get(`/editor/test/query/${invalidQueryId}`)
            .then( () => browser.waitForAngular() )
            .then( () => {
                expect(browser.getCurrentUrl()).not.toContain("query");
                expect(browser.getCurrentUrl()).not.toContain(invalidQueryId);
                expect(flashMessage.getText()).toContain(invalidQueryId);
            });
    });
});
