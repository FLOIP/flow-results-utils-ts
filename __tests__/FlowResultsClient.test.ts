import { FlowResultsClient } from '../index'
require('dotenv').config()

describe('Query Examples', () => {

    const baseUrl = process.env.TEST_BASE_URL;
    const authHeader = process.env.TEST_AUTH_HEADER;

    test('Get Packages List', async () => {

        const client = new FlowResultsClient(baseUrl, authHeader);
        const response = await client.getPackages().then((r) => r.data).catch((e) => { console.log('Error', e)});
        // console.log(response);
        expect(response).toEqual(expect.anything());

    });

    test('Get Packages List of IDs', async () => {

        const client = new FlowResultsClient(baseUrl, authHeader);
        const response = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});
        // console.log(response);
        expect(response).toEqual(expect.anything());

    });

    test('Get Package Descriptor', async () => {

        const client = new FlowResultsClient(baseUrl, authHeader);
        const packageIds = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});
        const response = await client.getPackage(packageIds[0]).then((r) => r.data).catch((e) => { console.log('Error', e)});
        // console.log(response);
        expect(response).toEqual(expect.anything());

    });

    test('Get Package Data', async () => {

        // Get Package Descriptor
        const client = new FlowResultsClient(baseUrl, authHeader);
        const packageIds = await client.getPackagesIds().then((r) => r.data).catch((e) => { console.log('Error', e)});
        const frPackage = await client.getPackage(packageIds[0]).then((r) => r.data).catch((e) => { console.log('Error', e)});
        if(frPackage) {
            // Get First page of responses from Package
            const response = await client.getResponsesFromPackage(frPackage,
                { 
                    'filter[start-timestamp]' : '2020-03-20 12:00:00',
                    'page[size]': '2'
                }
                ).then((r) => r.data).catch((e) => { console.log('Error', e)});
            // console.log(response);
            expect(response).toEqual(expect.anything());

            if(response) {
                // Get second page of responses using FlowResultsResponseSet.next()
                const response2 = await response.next().then((r) => r.data).catch((e) => { console.log('Error', e)});
                // console.log(response2);
                expect(response2).toEqual(expect.anything());
            }
        }
    });

});