[![TypeScript version][ts-badge]][typescript-38]
[![Node.js version][nodejs-badge]][nodejs]
[![MIT][license-badge]][LICENSE]

# flow-results-utils

A set of Typescript utilities for working with Flow Results packages and data, from the [Flow Interoperability Project](https://flowinterop.org).
For the Flow Results standard, see:

+ https://floip.gitbook.io/flow-results-specification/
+ http://github.com/floip/flow-results

This library provides:

+ Typescript model objects for representing and validating Flow Results packages: models/FlowResultsDataPackage.ts
+ A client library that wraps axios for operations on the Flow Results API: services/FlowResultsClient.ts
+ Useful conversion libraries, such as converting Flow Results to data models within the [HL7 FHIR Specification](https://www.hl7.org/fhir/).


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
## Working with Flow Results and other data standards

### HL7 FHIR
This package provides capabilities of converting Flow Results into the FHIR standard used by the digital health sector. Flow Result Descriptors are represented as FHIR [Questionnaires](https://www.hl7.org/fhir/questionnaire.html), and Flow Results Response datasets are represented as multiple [QuestionnaireResponses](https://www.hl7.org/fhir/questionnaireresponse.html).

These converters provide an object-oriented API (FlowResultsToFHIRConverter), and a simple function API; either can be used.

#### Usage example: Object-oriented API

```javascript
import { FlowResultsToFHIRConverter } from '@floip/flow-results-utils'
// Optional: If useful for working with the types of the returned objects: R4.IQuestionnaire and R4.IQuestionnaireResponse
import { R4 } from  '@ahryman40k/ts-fhir-types';

// frPackage is a FlowResultsDataPackage, previously parsed or retrieved from a FlowResultsClient
const frPackage: FlowResultsDataPackage = fromAbove();
const responses = [
            ["2019-04-09T23:40:12+00:00","962496841403224064","962496826479890432","962496826597330944","q_1521915343920_16","Survey again",{}],
            ["2019-04-09T23:40:19+00:00","962497190767775744","962496826479890432","962496826597330944","q_1520727469077_84","OMG YES",{}],
            ["2019-04-09T23:40:29+00:00","962497220186624000","962496826479890432","962496826597330944","q_1520739431185_81","Data understanding",{}],
            ["2019-04-09T23:40:38+00:00","962497262641369088","962496826479890432","962496826597330944","q_1520727585604_31","3.0000",{}],
            ["2019-04-09T23:41:12+00:00","962497300541100032","962496826479890432","962496826597330944","q_1520727871659_64","Transformative, not just efficiency, improvements to implementers.",{"type": "text"}]
        ];

// Convert a FlowResults Descriptor to a FHIR Questionnaire
const converter = new FlowResultsToFHIRConverter(frPackage);
const fhirQuestionnaire = converter.toQuestionnaire();
console.log(JSON.stringify(fhirQuestionnaire, null, 2));
/*
Result:
{
        "resourceType": "Questionnaire",
        "id": "5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65",
        "version": "2020-05-18T02:00:42+00:00",
        "name": "flow_interop_social_demo",
        "title": "Flow Interop Social Demo",
        "status": "active",
        "date": "2020-05-18T02:00:42+00:00",
        "item": [
          {
            "linkId": "q_1520727469077_84",
            "text": "How interested and excited are you for increased interoperability in ICT4D?",
            "type": "choice",
...
*/

// Convert a known set of Flow Results Responses that make up a session to a FHIR QuestionnaireResponse
const fhirQuestionnaireResponse = converter.toQuestionnaireResponse(responses);
console.log(JSON.stringify(fhirQuestionnaire, null, 2));
/*
Result:
{
        "resourceType": "QuestionnaireResponse",
        "id": "5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65-962496826597330944",
        "status": "completed",
        "subject": {
          "id": "962496826479890432",
          "display": "Contact ID 962496826479890432"
        },
        "authored": "2019-04-09T23:41:12+00:00",
        "item": [
          {
            "linkId": "q_1521915343920_16",
            "text": "How can I help out today?",
            "answer": [
              {
                "valueCoding": {
                  "code": "Survey again"
                }
              }
            ]
          },
          {
            "linkId": "q_1520727469077_84",
            "text": "How interested and excited are you for increased interoperability in ICT4D?",
...
*/
```
#### Usage Example: Function API

```javascript
import { fhirQuestionnaireFromFlowResults, fhirQuestionnaireResponseFromFlowResults } from '@floip/flow-results-utils'
import { R4 } from  '@ahryman40k/ts-fhir-types';

// Convert a FlowResults Descriptor to a FHIR Questionnaire
const fhirQuestionnaire = fhirQuestionnaireFromFlowResults(frPackage)
console.log(JSON.stringify(fhirQuestionnaire, null, 2));

// Convert a known set of Flow Results Responses that make up a session to a FHIR QuestionnaireResponse
const fhirQuestionnaireResponse = fhirQuestionnaireResponseFromFlowResults(frPackage, responses);
console.log(JSON.stringify(fhirQuestionnaire, null, 2));
```

#### Using FlowResultsClient to get all Responses from a server, and converting them all to QuestionnaireResponses

```javascript
import { FlowResultsClient, fhirQuestionnaireResponsesFromFlowResultsResponseSet } from '@floip/flow-results-utils'

// Get Package Descriptor
const client = new FlowResultsClient(baseUrl, authHeader);
const packageIds = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});
const frPackage = await client.getPackage(packageIds[0]).then((r) => r.data).catch((e) => { console.log('Error', e)});

if(frPackage) {
    // Convert all Responses to QuestionnaireResponse
    await fhirQuestionnaireResponsesFromFlowResultsResponseSet(frPackage,
        client.getResponsesFromPackage(frPackage, { 
                'filter[start-timestamp]' : '2020-01-01 12:00:00',
                'page[size]': '500' // Adjust page size for memory consumption, up to the limits of server. Larger page sizes will be faster but consume more memory in the converter.
            }
        ),
        // Provide a callback function that receives and processes/stores the converted QuestionnaireResponses:
        questionnaireResponses => {
            questionnaireResponses.forEach(qr => {
                // Do something with each QuestionnaireResponse
                console.log(JSON.stringify(qr, null, 2));
            });
        }
    ).catch((e) => { console.log('Error', e)});
}
```

[ts-badge]: https://img.shields.io/badge/TypeScript-3.8-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2012.13-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v12.x/docs/api/
[typescript]: https://www.typescriptlang.org/
[typescript-38]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/FLOIP/flow-results-utils-ts/blob/master/LICENSE
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
