import { FlowResultsClient, fhirQuestionnaireResponsesFromFlowResultsResponseSet } from '../src/index'
require('dotenv').config()

describe('Query Examples', () => {

    const baseUrl = process.env.TEST_BASE_URL;
    const authHeader = process.env.TEST_AUTH_HEADER;

    test('Convert Flow Responses to FHIR QuestionnaireResponses', async () => {

        // Get Package Descriptor
        const client = new FlowResultsClient(baseUrl, authHeader);
        const packageIds = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});
        const frPackage = await client.getPackage(packageIds[0]).then((r) => r.data).catch((e) => { console.log('Error', e)});
        let questionnaireResponsesCount = 0;
        
        if(frPackage) {
            // Convert all Responses to QuestionnaireResponse
            await fhirQuestionnaireResponsesFromFlowResultsResponseSet(frPackage,
                client.getResponsesFromPackage(frPackage, { 
                        'filter[start-timestamp]' : '2020-01-01 12:00:00',
                        'page[size]': '10'
                    }
                ),
                questionnaireResponses => {
                    questionnaireResponsesCount = questionnaireResponsesCount + questionnaireResponses.length;
                    questionnaireResponses.forEach(qr => {
                        qr;
                        // console.log(JSON.stringify(_qr, null, 2));
                    });
                }
                ).catch((e) => { console.log('Error', e)});

            // console.log("Found this many questionnaireResponses: " + questionnaireResponsesCount);
            expect(questionnaireResponsesCount).toEqual(expect.anything());
        }
    });

});