[![TypeScript version][ts-badge]][typescript-38]
[![Node.js version][nodejs-badge]][nodejs]
[![MIT][license-badge]][LICENSE]

# floip-results-utils

A set of Typescript utilities for working with Flow Results packages and data, from the [Flow Interoperability Project](https://flowinterop.org).
For the Flow Results standard, see:

+ https://floip.gitbook.io/flow-results-specification/
+ http://github.com/floip/flow-results

This library provides:

+ Typescript model objects for representing and validating Flow Results packages: models/FlowResultsDataPackage.ts
+ A client library that wraps axios for operations on the Flow Results API: services/FlowResultsClient.ts
+ Upcoming: useful conversion libraries, such as converting Flow Results to [FHIR Questionnaire](https://www.hl7.org/fhir/questionnaire.html) and [QuestionnaireResponse](https://www.hl7.org/fhir/questionnaireresponse.html) from the FHIR specification.


## Getting Started

This library is intended to be compatible from the browser or within Node.js applications. 

## Usage

To import a FlowResultsDataPackage from JSON and validate it:

```javascript
import { FlowResultsDataPackage, parse } from '@floip/flow-results-utils';

const frPackage = parse(FlowResultsDataPackage, JSON.parse(flowResultsPackageText));
```

To use the client to access a Flow Results server, and retrieve a Flow Results data package:

```javascript
import { FlowResultsClient } from "@floip/flow-results-utils";
const baseUrl = process.env.TEST_BASE_URL;
const authHeader = process.env.TEST_AUTH_HEADER;

const client = new FlowResultsClient(baseUrl, authHeader);

// Get list of Packages:

// getPackages returns a Promise<AxiosResponse<FlowResultsDataPackage>>. The AxiosResponse allows examining the return status, headers, etc. if needed. 
// For just the result, access AxiosResponse.data.
// `response` will be a FlowResultsDataPackage if the promise resolves.
const packages = await client.getPackages().then((r) => r.data).catch((e) => { console.log('Error', e)});

// Get a simple array of available package IDs:
const packageIds = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});

// Get a Package:
const frPackage = await client.getPackage(packageIds[0]).then((r) => r.data).catch((e) => { console.log('Error', e)});

// Get the first page of Responses from a Package, with filters and parameters:
// (responses1 is a FlowResultsResponseSet, which can be used to paginate through the remaining Responses.)
const responses1 = await client.getResponsesFromPackage(frPackage,
                { 
                    'filter[start-timestamp]' : '2020-03-20 12:00:00',
                    'page[size]': '2'
                }
                ).then((r) => r.data).catch((e) => { console.log('Error', e)});

// Get the next page of Responses:
const responses2 = await responses1.next().then((r) => r.data).catch((e) => { console.log('Error', e)});
```


