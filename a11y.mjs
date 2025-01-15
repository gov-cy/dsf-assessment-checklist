import pa11y from 'pa11y';
import { writeFile } from 'fs/promises';

(async function() {
    // set testing URLs
    let pagesJson = [
        {url:"#!"}
        ,{url:"#!/privacy"}
        ,{url:"#!/cookies"}
        ,{url:"#!/accessibility"}
        ,{url:"#!/checklist/preliminary"}
        ,{url:"#!/checklist/preliminary/list/1/list"}
        ,{url:"#!/checklist/preliminary/list/2/list"}
        ,{url:"#!/checklist/preliminary/all"}
        ,{url:"#!/checklist/preliminary/review"}
        ,{url:"#!/checklist/final"}
        ,{url:"#!/checklist/final/list/3/list"}
        ,{url:"#!/checklist/final/list/4/list"}
        ,{url:"#!/checklist/final/list/5/list"}
        ,{url:"#!/checklist/final/all"}
        ,{url:"#!/checklist/final/review"}
    ]
    // define the server URL. Note this means the test is run on localhost
    let serverURL = "http://localhost:3000/docs/";
    console.log(`## Run tests`);
    // run tests
    await testAccessibilityAndSave(pagesJson, serverURL);
})();

async function testAccessibilityAndSave(pages,serverURL) {
    const resultsArray = [];
    let failed = false; // Track failures
    // for each page
    for (var page of pages) {
        try {
            console.log(`Testing ${page.url}`);
            // run pa11y
            const results = await pa11y(serverURL + page.url, 
                {
                    standard: 'WCAG2AA'
                    ,ignore: [
                        'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID'
                    ]
                });
            // push results in an array
            resultsArray.push({ url: page.url, issues: results.issues });
            // if there are accessibility issues write on the console
            if (results.issues.length > 0) {
                console.error(`Accessibility issues found in ${page.url}`);
                console.error(results.issues);
                failed = true; // Mark as failed if any issues are found
            }
        } catch (error) {
            console.error(`Error testing ${page.url}:`, error.message);
            failed = true; // Mark as failed if an error occurs
        }
    }
    
    try {
        // add date and results to the json
        const resultsJSON = {
            date: new Date().toISOString().split('T')[0],
            results: resultsArray
        }
        // write to file on special `data` folder 
        await writeFile('docs/data/accessibilityresults.json', JSON.stringify(resultsJSON, null, 2));
        console.log('Results saved to `docs/data/accessibilityresults.json`');
    } catch (fileError) {
        console.error('Error saving results:', fileError.message);
        failed = true; // Mark as failed if an error occurs
    }

    // Exit with code 1 if any tests failed, otherwise exit with code 0
    process.exit(failed ? 1 : 0);
}