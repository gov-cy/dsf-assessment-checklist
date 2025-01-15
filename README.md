# DSF Assessment Checklist

This project is a simple checklist demo application designed by the DSF (Digital Service Factory) team. It is intended to demonstrate :
- usability and accessibility though Single Page Applications (SPA) 
- the usage of govcy-frontend-renderer browser library 
- the usage of CDN developer assets in latest major version with jsdelivr
- the Progressive Web App (PWA) capabilities with Workbox.

The demo app showcases a set of assessment checklists that can be used by teams implementing DSF services. 

## Features

- Checklist management
- Accessibility testing with Pa11y
- Progressive Web App (PWA) support using Workbox
- Multi-language support
- Dynamic menu rendering
- Offline functionality

## Prerequisites

- Node.js 8+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dsf-assessment-checklist.git
```

2. Navigate to the project directory:
```bash
cd dsf-assessment-checklist
```

3. Install dependencies:
```bash
npm install
```

## Usage

1. Start the local server:
```bash
npm start
```
This will start the server on `http://localhost:3000` and open the `docs` directory.

2. Customize the checklists: 
The checklists are defined in the [lists.json](docs/data/lists.json) file. You can add, remove, or modify checklists as needed.

3. Run accessibility tests:
Accessibility testing: Run the accessibility tests using Pa11y:
```bash
npm run a11y-test
```
The results will be saved in the [accessibilityresults.json](docs/data/accessibilityresults.json) file.

4. Changes in the service worker 
Check the [PWA Read me file](PWA-README.md) for instructions on how to update the service worker.

## License

The package is released under the [MIT License](https://opensource.org/licenses/MIT).

## Contact

If you have any questions or feedback, please feel free to reach out to us at [dsf-admin@dits.dmrid.gov.cy](mailto:dsf-admin@dits.dmrid.gov.cy)