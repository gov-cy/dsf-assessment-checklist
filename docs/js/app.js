


document.addEventListener("DOMContentLoaded", async function () {
    // Initialize GovcyFrontendRendererBrowser data
    const inputData = config.govcyRendererConfig;
    // Check if GovcyFrontendRendererBrowser is defined
    if (typeof GovcyFrontendRendererBrowser === 'undefined') {
        console.error('GovcyFrontendRendererBrowser is not defined');
        return;
    }
    // Create an instance of GovcyFrontendRendererBrowser
    const govcyRenderer = new GovcyFrontendRendererBrowser();
    //check for supported javascript features
    if (!_isFeatureSupported()) {
        console.error('Required features are not supported by this browser.');
        _renderPageContent(govcyRenderer.renderFromJSON(config.pages["features_not_supported"], inputData));
        return;
    }
    // Initialize Navigo
    var root = null;
    var useHash = true; // Defaults to: false
    var hash = '#!'; // Defaults to: '#'
    var router = new Navigo(root, useHash, hash);

    // Initialize accessibility report
    var accessibilityReport = false;

    // fetch the data
    fetch(config.dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(dataIn => {
            console.log(dataIn);
            //render menu
            _renderMenu(dataIn, inputData);
            router
                // ---------  `/` route --------- 
                .on('/', function () {
                    let navHTML = '<ul class="govcy-list-unstyled">';
                    dataIn.forEach((checklist, index) => {
                        console.log(checklist.id);
                        navHTML += `<li><h2 class="govcy-fs-4"><a class='govcy-link-no-visited-state' href="#!/checklist/${checklist.id}">${checklist.title[inputData.site.lang]}</a></h2></li>`;
                    })
                    navHTML += '</ul>';
                    _renderPageContent(navHTML);
                    // set active menu item
                    _setActiveMenuItem();
                })
                // ---------  `/privacy` route --------- 
                .on('/privacy', function () {
                    _renderPageContent(govcyRenderer.renderFromJSON(config.pages["privacy"], inputData));
                    // set active menu item
                    _setActiveMenuItem();
                })
                // ---------  `/cookies` route --------- 
                .on('/cookies', function () {
                    _renderPageContent(govcyRenderer.renderFromJSON(config.pages["cookies"], inputData));
                    // set active menu item
                    _setActiveMenuItem();
                })
                // ---------  `/accessibility` route --------- 
                .on('/accessibility', function () {
                    _renderPageContent(govcyRenderer.renderFromJSON(config.pages["accessibility"], inputData));
                    // set active menu item
                    _setActiveMenuItem();
                    // render accessibility report
                    if (!accessibilityReport) {
                        // fetch the data
                        fetch(config.accessibilityReport)
                            .then(aResponse => {
                                if (!aResponse.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return aResponse.json();
                            })
                            .then(aData => {
                                accessibilityReport = aData;
                                _renderAccessibility(aData, govcyRenderer, inputData);
                            })
                            .catch(error => {
                                console.error('There was a problem with the fetch operation:', error);
                            })
                    } else {
                        _renderAccessibility(accessibilityReport, govcyRenderer, inputData);
                    }
                })
                // ---------  `/clear` route --------- 
                .on('/clear', function () {
                    let navHTML = '';
                    navHTML += govcyRenderer.renderFromJSON(config.pages["clear-question"], inputData);
                    // Define where back goes
                    config.other_elements["back-link"].params.href = `javascript:history.back();`;
                    _renderPageContent(navHTML
                        , govcyRenderer.renderFromJSON({ "elements": [config.other_elements["back-link"]] }, inputData)
                    );
                    // set active menu item
                    _setActiveMenuItem();
                    // register click event on button with id 'clear-question-continue' 
                    document.getElementById('clear-question-continue').addEventListener('click', function () {
                        // check the radios with name `clear-question` if the selected value is yes or no
                        if (document.querySelector('input[name="clear-question"]:checked').value === 'yes') {
                            //find all entries in localstorage that start with `${config.appId}` and remove them
                            for (let i = localStorage.length - 1; i >= 0; i--) {
                                const key = localStorage.key(i);
                                if (key.startsWith(`${config.appId}`)) {
                                    localStorage.removeItem(key);
                                }
                            }
                        } else {

                        }
                        window.location.href = '#!/';
                    }) 
                })
                // ---------  `maincontained` route --------- 
                .on('/mainContainer', function () {
                    // Get the element with the ID 'mainContainer'
                    const mainContainer = document.getElementById('mainContainer');
                    const mainContent = document.getElementById('mainContent');
                    if ((mainContainer) && (mainContent.innerHTML.length > 0)) {
                        mainContainer.setAttribute('tabindex', "-1");
                        mainContainer.focus();
                        // Scroll the element into view
                        mainContainer.scrollIntoView();
                    } else {
                        window.location.href = '#!/';
                    }
                })
                // ---------  `404` route --------- 
                .notFound(function () {
                    // Render the page content, with a back link
                    _renderPageContent(govcyRenderer.renderFromJSON(config.pages["404"], inputData));
                    // set active menu item
                    _setActiveMenuItem();
                });
            // Access the checks.elements array
            dataIn.forEach((data, index) => {
                const elements = data.checks.elements;
                // console.log(data);
                // Define standard routes
                router
                    // ---------  `/checklist/:id` route --------- 
                    .on('/checklist/' + data.id, function () {
                        let navHTML = '';
                        // Set the top elements
                        config.top_section.elements[0].params.text = data.title;
                        navHTML += govcyRenderer.renderFromJSON(config.top_section, inputData);
                        // Create a task list table 
                        let taskListTable = {
                            "element": "table",
                            "params": {
                                "rows": []
                            }
                        };
                        // Loop through the checkbox elements and create links and status
                        elements.forEach((element, index) => {
                            if (element.element === 'checkboxes') {
                                taskListTable.params.rows.push(
                                    [
                                        {
                                            "elements": [
                                                {
                                                    "element": "htmlElement",
                                                    "params": {
                                                        "text": { [inputData.site.lang]: `<a class='govcy-link-no-visited-state' href="#!/checklist/${data.id}/list/${element.params.id}/list">${element.params.legend[inputData.site.lang]}</a>` }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "elements": [
                                                _getStatusTagElement(_checkListStatus(element))
                                            ]
                                        }
                                    ]
                                );
                            }
                        });

                        // Define where continue button goes
                        config.other_elements["continue-button"].params.prototypeNavigate = `#!/checklist/${data.id}/review`;
                        navHTML += govcyRenderer.renderFromJSON({ "elements": [taskListTable, config.other_elements["continue-button"], config.other_elements["clear-button"]] }, inputData);
                        navHTML += `<a class="govcy-ml-3 govcy-link-no-visited-state" href="#!/checklist/${data.id}/all">All Checks</a>`;
                        _renderPageContent(navHTML);
                        // set active menu item
                        _setActiveMenuItem(data.id);
                    })
                    // --------- `review` route --------- 
                    .on(`/checklist/${data.id}/review`, function () {
                        let navHTML = '';
                        // Get the top elements
                        config.top_section.elements[0].params.text = data.title;
                        navHTML += govcyRenderer.renderFromJSON(config.top_section, inputData);
                        // Create a summary list
                        let summaryList = {
                            "element": "summaryList",
                            "params": {
                                "items": []
                            }
                        };
                        // Loop through the checkbox elements and create rows
                        elements.forEach((element, index) => {
                            if (element.element === 'checkboxes') {
                                // Create a summary list item with the checkbox name and status
                                let summaryListItem = {
                                    "key": element.params.legend,
                                    "value": [
                                        {
                                            "element": "table"
                                            , "params": {
                                                "rows": []
                                            }
                                        }
                                    ],
                                    "actions": [
                                        {
                                            "text": config.other_content.change
                                            , "classes": "govcy-link-no-visited-state"
                                            , "visuallyHiddenText": element.params.legend
                                            , "href": `#!/checklist/${data.id}/list/${element.params.id}/review`
                                        }
                                    ]
                                };
                                // loop through the checkbox items and add them to the summary list
                                element.params.items.forEach(item => {
                                    summaryListItem.value[0].params.rows.push([
                                        {
                                            "elements": [
                                                {
                                                    "element": "htmlElement",
                                                    "params": {
                                                        "text": item.text
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "elements": [
                                                _getStatusTagElement(_checkListItemStatus(element, item))
                                            ]
                                            , classes: "govcy-text-end",
                                        }
                                    ]);
                                });
                                summaryList.params.items.push(summaryListItem);
                            }
                        });
                        console.log(summaryList);
                        // Render the summary list
                        navHTML += govcyRenderer.renderFromJSON({ "elements": [summaryList] }, inputData);
                        // Add a print button
                        navHTML += govcyRenderer.renderFromJSON({ "elements": [config.other_elements["print-button"]] }, inputData);
                        // Define where back goes
                        config.other_elements["back-link"].params.href = `#!/checklist/${data.id}`;
                        _renderPageContent(navHTML
                            , govcyRenderer.renderFromJSON({ "elements": [config.other_elements["back-link"]] }, inputData)
                            , 'max-width'
                        );
                        // set active menu item
                        _setActiveMenuItem(data.id);
                    })
                    // ---------  `all` route --------- 
                    .on(`/checklist/${data.id}/all`, function () {
                        // Define where back goes
                        config.other_elements["back-link"].params.href = `#!/checklist/${data.id}`;
                        // Define where continue button goes
                        config.other_elements["continue-button"].params.prototypeNavigate = `#!/checklist/${data.id}/review`;
                        // Define the top section
                        config.top_section.elements[0].params.text = data.title;
                        // Merge the elements arrays
                        const mergedElements =
                        {
                            elements: [
                                ...config.top_section.elements,
                                ...data.checks.elements,
                                ...(config.bottom_section ? config.bottom_section.elements : [])
                            ]
                        };
                        mergedElements.elements.push(config.other_elements["continue-button"]);
                        // Render the page content, with a back link
                        _renderPageContent(
                            govcyRenderer.renderFromJSON(mergedElements, inputData)
                            , govcyRenderer.renderFromJSON({ "elements": [config.other_elements["back-link"]] }, inputData)
                        );
                        // set active menu item
                        _setActiveMenuItem(data.id);
                    })

                // --------- Define dynamic routes --------- 

                // Loop through the elements and create routes
                elements.forEach((element, index) => {
                    if (element.element === 'checkboxes') {
                        //create route with the id of the checkbox
                        router.on(`/checklist/${data.id}/list/${element.params.id}/:destination`, function (params) {
                            // Define where back goes
                            const destinationIn = params.destination;
                            let urlDestination = "";
                            if (destinationIn == 'list') {
                                urlDestination = '';
                            } else if (destinationIn == 'review') {
                                urlDestination = '/review';
                            }
                            // Create a deep copy of the element
                            const elementCopy = JSON.parse(JSON.stringify(element));
                            // Set page heading to true
                            elementCopy.params.isPageHeading = true;
                            // Define where back goes
                            config.other_elements["back-link"].params.href = `#!/checklist/${data.id}${urlDestination}`;
                            // Define where continue button goes
                            config.other_elements["continue-button"].params.prototypeNavigate = `#!/checklist/${data.id}${urlDestination}`;
                            // render the element with back link
                            _renderPageContent(govcyRenderer.renderFromJSON({ "elements": [elementCopy, config.other_elements["continue-button"]] }, inputData)
                                , govcyRenderer.renderFromJSON({ "elements": [config.other_elements["back-link"]] }, inputData));
                            // set active menu item
                            _setActiveMenuItem(data.id);
                        });
                    }
                });

            });
            router.resolve();

        })
        .catch(error => {
            _renderPageContent(govcyRenderer.renderFromJSON(config.pages["500"], inputData));
            console.error('There was a problem with the fetch operation:', error);
        });

});

/**
 * Render the given HTML in the main content area
 * 
 * @param {string} mainContent - The HTML content to render in the main content area
 * @param {string} beforeMainContent - Optional, The HTML content to render before the main content
 * @param {string} layout - Optional, Which layout to use (default is 'two-thirds'). Can also have `max-width` value
 */
function _renderPageContent(mainContent, beforeMainContent, layout) {
    // Get the element with the ID 'mainContainer'
    const mainContainer = document.getElementById('mainContainer');
    // Get the element with the ID 'mainContent'
    const mainContentObj = document.getElementById('mainContent');
    // Set the main content
    mainContentObj.innerHTML = mainContent;
    // focus on mainContainer
    mainContainer.setAttribute('tabindex', "-1");
    mainContainer.focus();
    // Scroll the element into view
    // mainContainer.scrollIntoView();

    // Set the before main content
    if (beforeMainContent) {
        document.getElementById('beforeMainContainer').innerHTML = beforeMainContent;
    } else {
        document.getElementById('beforeMainContainer').innerHTML = '';
    }

    //Change the layout
    mainContentObj.className = ''; // Remove all classes
    const classes = ['govcy-form'];
    if (layout === 'max-width') {
        classes.push('govcy-col-12');
    } else {
        classes.push('govcy-col-8');
    }
    mainContentObj.classList.add(...classes);

    // Load saved input values from local storage
    _loadSavedInputValues();
    // Register input change events to save their values to localStorage
    _registerInputChangeEvents();
}

/**
 * Render the accessibility report
 * 
 * @param {object} aReport - The accessibility report object
 * @param {object} govcyRenderer - The govcy renderer object
 * @param {object} inputData - The input data object
 * */
function _renderAccessibility(aReport, govcyRenderer, inputData) {
    const accessibilityReportContainer = document.getElementById('accessibilityReport');
    config.other_elements["accessibility-report-table"].params.rows = [];
    try {
        //set date
        document.getElementById('accessibilityReportDate').innerHTML = aReport.date;
        //for each page in te report
        aReport.results.forEach((item, index) => {
            // instantiate table row with cell of the url
            let tRow = [
                {
                    elements:
                    [
                        {
                            element: "htmlElement",
                            params:
                            {text:{[inputData.site.lang]: `<a class='govcy-link-no-visited-state' href="${item.url}">${item.url}</a>`}}
                        }
                    ]
                }
            ];
            //if there are issues
            if (item.issues.length > 0) {
                // add row with `fail` tag element
                let failObjs =
                {
                    elements: 
                    [
                        {element:"tag",params:{text:{[inputData.site.lang]:"FAIL"}, classes:"govcy-tag-orange"} }
                    ]
                }
                // add row with the issues message
                let issueObjs ={
                    elements: []
                };
                item.issues.forEach((issue, index) => {
                    issueObjs.elements.push(
                        {element:"textElement",params:{text:{[inputData.site.lang]:issue.message}} }
                    )
                })
                tRow.push(failObjs);
                tRow.push(issueObjs);
            } else {
                // add row with `pass` tag element
                tRow.push(
                    {
                    elements: 
                        [
                            {element:"tag",params:{text:{[inputData.site.lang]:"PASS"}, classes:"govcy-tag-green"} }
                        ]
                    }, 
                    {
                    elements: 
                        [
                            {element:"textElement",params:{text:{[inputData.site.lang]: " "}} }
                        ]
                    }
                )
            }
            config.other_elements["accessibility-report-table"].params.rows.push(tRow);
        })
        // Render the accessibility report
        accessibilityReportContainer.innerHTML = govcyRenderer.renderFromJSON({ "elements": [config.other_elements["accessibility-report-table"]] }, inputData);
    } catch (error) {
        console.error(error);
    }
}
/**
 * Render the checklist menu
 * 
 * @param {*} dataIn The data containing the checklists
 * @param {*} inputData The input data used to render the page
 */
function _renderMenu(dataIn, inputData) {
    let navHTML = '';
    dataIn.forEach((checklist, index) => {
        console.log(checklist.id);
        navHTML += `<li><a class='govcy-link-no-visited-state' id="menuItem_${checklist.id}" href="javascript:_menuNavToChecklist('${checklist.id}');" class="govcy-menu-item govcy-menu-item-level-1">${checklist.menu[inputData.site.lang]}</a></li>`;
    })
    document.getElementById("mainMenu").innerHTML = navHTML;
}

function _menuNavToChecklist(id) {
    document.getElementsByClassName('govcy-menu-item govcy-expand-btn')[0].click(); 
    window.location.href =`#!/checklist/${id}`
}

/**
 * Set the active menu item 
 * 
 * @param {string} checklistId - The ID of the checklist 
 */
function _setActiveMenuItem(checklistId) {
    const mainMenu = document.getElementById('mainMenu');
    // Remove aria-current and active class from all child elements of mainMenu
    const childElements = mainMenu.querySelectorAll('[aria-current], .active');
    childElements.forEach(element => {
        element.removeAttribute('aria-current');
        element.classList.remove('active');
    });
    if (checklistId) {
        const menuItem = document.getElementById(`menuItem_${checklistId}`);
        if (menuItem) {
            menuItem.setAttribute('aria-current', 'true');
            menuItem.classList.add('active');
        }
    }
}

/**
 * Check the status of a checklist item based on the local storage
 * 
 * @param {*} checklist the checklist object to be checked
 * @param {*} item the item object to be checked
 * @returns 1 if the item is checked, 2 if the item is not checked
 */
function _checkListItemStatus(checklist, item) {

    const key = `${config.appId}${checklist.params.name || checklist.params.id}`; // Add prefix to the key
    const savedValue = localStorage.getItem(key);
    // if null not started yet
    if (savedValue == null) {
        return 2; // The item is not checked (fail)
    }
    // Parse the saved array from local storage
    const savedArray = JSON.parse(savedValue);
    // Check if the item is included in the saved array
    const checked = savedArray.includes(item.value);
    if (checked) {
        return 1; // The items is checked (pass)
    } else {
        return 2; // The item is not checked (fail)
    }
}

/**
 * Check the status of a checklist based on the local storage
 * 
 * @param {*} checklist the checklist object to be checked 
 * @returns 0 if not started, 1 if all items are checked, 2 if at least one item is not checked
 */
function _checkListStatus(checklist) {
    //set status to not started 
    let status = 0;
    const key = `${config.appId}${checklist.params.name || checklist.params.id}`; // Add prefix to the key
    const savedValue = localStorage.getItem(key);
    // if null not started yet
    if (savedValue == null) {
        return status;
    }
    // Parse the saved array from local storage
    const savedArray = JSON.parse(savedValue);
    const items = checklist.params.items;

    // Check if all items are included in the saved array
    const allChecked = items.every(item => savedArray.includes(item.value));

    if (allChecked) {
        return 1; // All items are checked (pass)
    }

    return 2; // At least one item is not checked (fail)
}


/**
 * Get the status tag element based on the status
 * 
 * @param {number} status - The status of the checklist
 * @returns {object} The status tag element
 */
function _getStatusTagElement(status) {
    if (status === 0) {
        return config.other_elements["status-not-started"];
    } else if (status === 1) {
        return config.other_elements["status-passed"];
    } else if (status === 2) {
        return config.other_elements["status-not-passed"];
    }
}

/**
 * Check if the required features are supported by the browser
 * 
 * @returns {boolean} True if all required features are supported, false otherwise
 */
function _isFeatureSupported() {
    try {
        // Check for fetch support
        if (!window.fetch) {
            return false;
        }

        // Check for spread operator support
        // This will throw an error if the spread operator is not supported
        eval('const test = [...[1, 2, 3]];');

        // Check for Array.prototype.forEach support
        if (typeof Array.prototype.forEach !== 'function') {
            return false;
        }

        // Check for Array.prototype.every support
        if (typeof Array.prototype.every !== 'function') {
            return false;
        }

        // Check for Array.prototype.includes support
        if (typeof Array.prototype.includes !== 'function') {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get all input values from a page and save them to local storage
 */
function _saveInputValuesTolocalStorage() {
    // Get all input elements (text, radio, checkbox, etc.), textareas, and selects
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        const key = `${config.appId}${input.name || input.id}`; // Add prefix to the key
        // special case exclude `clear-question`
        if (key != `${config.appId}clear-question`){
            if (input.type === 'checkbox') {
                // Handle checkboxes: save as an array of checked values
                let storedArray = JSON.parse(localStorage.getItem(key)) || [];
                if (input.checked) {
                    if (!storedArray.includes(input.value)) {
                        storedArray.push(input.value);
                    }
                } else {
                    // Remove unchecked value if it exists in the array
                    storedArray = storedArray.filter(value => value !== input.value);
                }
                localStorage.setItem(key, JSON.stringify(storedArray));
            } else if (input.type === 'radio') {
                // For radio buttons, only store the value of the checked one
                if (input.checked) {
                    localStorage.setItem(key, input.value);
                }
            } else if (input.tagName.toLowerCase() === 'select') {
                // For select elements, store the selected value
                const value = input.options[input.selectedIndex]?.value || '';
                localStorage.setItem(key, value);
            } else {
                // For other inputs (text, textarea, etc.), store their value
                localStorage.setItem(key, input.value);
            }
        }
    });

    console.log('All input values saved directly to local storage');
}

/**
 * Register input change events to save their values to localStorage.
 * Call this function whenever new inputs are added to the DOM.
 * 
 * @param {HTMLElement} container - The container to search for inputs (optional). Defaults to `document`.
 */
function _registerInputChangeEvents(container = document) {
    // Get all input, textarea, and select elements within the container
    const inputs = container.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        // Add change event listener to save the input value to localStorage
        input.addEventListener('change', _saveInputValuesTolocalStorage);
    });

    console.log('Change events registered for inputs in:', container);
}

/**
 * Load saved input values from localStorage into inputs, textareas, and selects.
 * @param {HTMLElement} container - The container to search for inputs (optional). Defaults to `document`.
 */
function _loadSavedInputValues(container = document) {
    const inputs = container.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        const key = `${config.appId}${input.name || input.id}`; // Add prefix to the key

        if (key && localStorage.getItem(key) !== null) {
            const savedValue = localStorage.getItem(key);

            if (input.type === 'text' || input.type === 'textarea' || input.tagName === 'SELECT') {
                input.value = savedValue;
            }

            if (input.type === 'checkbox') {
                // Check if the value is stored as an array
                let storedArray = JSON.parse(savedValue) || [];
                // If the checkbox value is in the stored array, check the checkbox
                input.checked = storedArray.includes(input.value);
            }

            if (input.type === 'radio') {
                input.checked = savedValue === input.value;
            }
        }
    });

    console.log('Saved values loaded from localStorage with prefix.');
}

function _mobileUI(mode) {
    let mobileHeader = document.getElementById('headerContainerMobile');
    let desktopHeader = document.getElementById('headerContainer');
    let mobileFooter = document.getElementById('footerContainerMobile');
    let desktopFooter = document.getElementById('footerContainer');
    let mainContainer = document.getElementById('mainContainer');
    if (mode === 'mobile') {
        mobileHeader.classList.remove('govcy-d-none');
        desktopHeader.classList.add('govcy-d-none');
        mobileFooter.classList.remove('govcy-d-none');
        desktopFooter.classList.add('govcy-d-none');
        mainContainer.classList.add('govcy-mb-6');
    } else {
        desktopHeader.classList.remove('govcy-d-none');
        mobileHeader.classList.add('govcy-d-none');
        desktopFooter.classList.remove('govcy-d-none');
        mobileFooter.classList.add('govcy-d-none');
        mainContainer.classList.remove('govcy-mb-6');
    }
}

const config = {
    "appId": "listsapp_",
    "dataUrl": "data/lists.json",
    "accessibilityReport": "data/accessibilityresults.json",
    "govcyRendererConfig": {
        "site": {
            "lang": "en"
        }
    },
    "pages": {
        "500": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Sorry, there is a problem with the service",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Try again later.",
                            "el": "..."
                        }
                    }
                }
            ]
        },
        "404": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Page not found",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "If you typed the web address, check it is correct.",
                            "el": "..."
                        }
                    }
                }
            ]
        },
        "clear-question": {
            "elements": [
                {
                    "element": "radios",
                    "params": {
                        "id":"clear-question"
                        ,"name":"clear-question"
                        ,"legend":{"en":"Are you sure you want to clear your answers?","el":"..."}
                        ,"hint":{"en":"This will clear all your answers","el":"..."}
                        ,"isPageHeading": true
                        ,"items":[
                            {
                                "value": "yes",
                                "text": {"en":"Yes","el":"Ναι"}
                            },
                            {
                                "value": "no",
                                "text": {"en":"No","el":"Όχι"},
                            }
                        ]
                    }
                },
                {
                    "element": "button",
                    "params": {
                        "text": {
                            "en": "Continue",
                            "el": "Συνέχεια"
                        },
                        "id": "clear-question-continue"
                    }
                }
            ]
        },
        "privacy": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Privacy policy – your personal information",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "This privacy policy explains what information is collected and stored about you.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Types of information collected and used",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "No personal or any other kind of data are collected this website.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Complaints",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p>You can complain about the way your personal information has been used by <a class='govcy-link-no-visited-state' href=\"https://www.dataprotection.gov.cy/dataprotection/dataprotection.nsf/page1i_en/page1i_en?opendocument\" rel=\"noreferrer noopener\" target=\"_blank\">contacting the Office of the Commissioner for Personal Data Protection (opens in new tab)</a></p>",
                            "el": "..."
                        }
                    }
                },
            ]
        },
        "cookies": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Cookies used by this website",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "This website does not use any cookies.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "How to control cookies",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p><a class='govcy-link-no-visited-state' href=\"https://www.aboutcookies.org/how-to-manage-and-delete-cookies\" rel=\"noreferrer noopener\" target=\"_blank\">Find out how to control and delete cookies on your device (opens in new tab)</a></p>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "You can delete all cookies that are already on your device and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.",
                            "el": "..."
                        }
                    }
                }
            ]
        },
        "accessibility": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Accessibility statement",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "This is an accessibility statement for this website",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Conformance status",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p>The <a class='govcy-link-no-visited-state' href=\"https://www.w3.org/TR/WCAG21/\" rel=\"noreferrer noopener\" target=\"_blank\">Web Content Accessibility Guidelines from W3C</a> (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. The service is fully conformant with WCAG 2.1 level AA.</p>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Compatibility with browsers and assistive technology",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "The service is not compatible with Internet Explorer.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Limitations and alternatives",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Despite our best efforts to ensure accessibility of the service, there may be some limitations. Below is a description of known limitations, and potential solutions. Please contact us if you observe an issue not listed below.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Javascript is required for the service to function properly.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Assessment approach",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "The Digital Services Factory assessed the accessibility of the service using:",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<ul><li><a class='govcy-link-no-visited-state' href=\"https://wave.webaim.org/\" rel=\"noreferrer noopener\" target=\"_blank\">WebAIM’s WAVE Evaluation tool</a></li><li><a class='govcy-link-no-visited-state' href=\"https://pa11y.org/\" rel=\"noreferrer noopener\" target=\"_blank\">Pa11y</a></li><li><a class='govcy-link-no-visited-state' href=\"https://www.browserstack.com/\" rel=\"noreferrer noopener\" target=\"_blank\">Browserstack</a></li><li><a class='govcy-link-no-visited-state' href=\"https://www.nvaccess.org/download/\" rel=\"noreferrer noopener\" target=\"_blank\">NVDA for Windows</a></li></ul>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Feedback and complaints",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "We welcome your feedback on the accessibility of the service. Please let us know if you encounter accessibility barriers when using it:",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<ul><li>Email:<a class='govcy-link-no-visited-state' href=\"mailto:dsf@dits.dmrid.gov.cy\">dsf@dits.dmrid.gov.cy</a></li></ul>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "We try to respond to feedback within 30 working days.",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "If we do not reply, or do not fix the issue, you can send a complaint to:",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "Deputy Minister of Research, Innovation, and Digital Policy<br>134 Lemesou Avenue,<br>2015 Strovolos, Lefkosia<br>Cyprus",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p>Or you can email: <a class='govcy-link-no-visited-state' href=\"mailto:info@dmrid.gov.cy\">info@dmrid.gov.cy</a></p>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p>If you are not satisfied with their response, you can <a class='govcy-link-no-visited-state' href=\"https://eforms.mof.gov.cy/eforms/eforms.nsf/complaintformombudsman_en/complaintformombudsman_en?OpenForm\" rel=\"noreferrer noopener\" target=\"_blank\">send a complaint to the Commissioner for Administration and the Protection of Human Rights</a> (Ombudsman).</p>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Report",
                            "el": "..."
                        },
                        "type": "h2"
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p>This report was created on <b id=\"accessibilityReportDate\"></b> based on an automated test performed with <a class='govcy-link-no-visited-state' href=\"https://pa11y.org/\" target=\"_blank\">pa11y</a>.</p>",
                            "el": "..."
                        }
                    }
                },
                {
                    "element": "htmlElement",
                    "params": {
                        "text": {
                            "en": "<p id=\"accessibilityReport\"></p>",
                            "el": "..."
                        }
                    }
                },
            ]
        },
        "features_not_supported": {
            "elements": [
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Your browser does not support some of the required features",
                            "el": "..."
                        },
                        "type": "h1"
                    }
                },
                {
                    "element": "textElement",
                    "params": {
                        "text": {
                            "en": "Update your browser to the latest version, or use a different modern browser.",
                            "el": "..."
                        }
                    }
                }
            ]
        }
    },
    "top_section": {
        "elements": [
            {
                "element": "textElement",
                "params": {
                    "text": {
                        "en": "Preliminary Assessment Checklist",
                        "el": "..."
                    },
                    "type": "h1"
                }
            }
        ]
    },
    "other_elements": {
        "success-button":
        {
            "element": "button",
            "params": {
                "text": {
                    "en": "Continue",
                    "el": "Συνέχεια"
                },
                "variant": "success",
                "id": "success-button"
            }
        },
        "print-button":
        {
            "element": "button",
            "params": {
                "text": {
                    "en": "Print",
                    "el": "..."
                },
                "variant": "secondary",
                "classes": "govcy-d-print-none",
                "id": "print-button",
                "prototypeNavigate": "javascript:window.print();"
            }
        },
        "continue-button":
        {
            "element": "button",
            "params": {
                "text": {
                    "en": "Continue",
                    "el": "..."
                },
                "classes": "govcy-d-print-none",
                "id": "continue-button",
                "prototypeNavigate": ""
            }
        },
        "clear-button":
        {
            "element": "button",
            "params": {
                "text": {
                    "en": "Clear answers",
                    "el": "..."
                },
                "classes": "govcy-d-print-none govcy-ml-3",
                "id": "clear-button",
                "variant": "secondary",
                "prototypeNavigate": "#!/clear"
            }
        },
        "back-link": {
            "element": "backLink",
            "params": {
                "href": "#!/",
                "text": {
                    "en": "Back",
                    "el": "Πίσω"
                }
            }
        },
        "status-not-passed": {
            "element": "tag",
            "params": {
                "text": {
                    "en": "NOT PASSED",
                    "el": "...."
                },
                "classes": "govcy-tag-orange"
            }
        },
        "status-passed": {
            "element": "tag",
            "params": {
                "text": {
                    "en": "PASSED",
                    "el": "...."
                },
                "classes": "govcy-tag-green"
            }
        },
        "status-not-started": {
            "element": "tag",
            "params": {
                "text": {
                    "en": "NOT STARTED",
                    "el": "...."
                },
                "classes": "govcy-tag-gray"
            }
        },
        "accessibility-report-table": {
            "element": "table",
            "params": {
                "responsiveType": "horisontal",
                "head": [
                    {
                        "text": {
                            "en": "Page",
                            "el": ".."
                        }
                    },
                    {
                        "text": {
                            "en": "Score",
                            "el": "..."
                        }
                    },
                    {
                        "text": {
                            "en": "Issues",
                            "el": "..."
                        }
                    }
                ],
                "rows": []
            }
        }
    },
    "other_content": {
        "change": { "en": "Change", "el": "..." }
    }
}