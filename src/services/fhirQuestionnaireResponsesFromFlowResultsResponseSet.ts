/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { FlowResultsDataPackage, FlowResultsResponseFields, FlowResultsResponse } from '../models/FlowResultsDataPackage';
import { AxiosResponse } from 'axios';
import { FlowResultsResponseSet } from "./FlowResultsClient"
import { FlowResultsToFHIRConverter } from "./FlowResultsToFHIRConverter"
import { R4 } from  '@ahryman40k/ts-fhir-types';

/**
 * Combines FlowResultsToFHIRConverter with FlowResultsClient to get all of the Flow Results responses at an endpoint and convert them to FHIRQuestionnaireResponse's.
 * Because there might be more responses than fit in memory, this function processes in batches (controlled via the page size parameter). 
 * You must provide a callback function that can accept an array of QuestionnaireResponse; the callback might be called one or multiple times with batches of results.
 * Note: All of the responses for one session (one QuestionnaireResponse) are not required to be ordered in Flow Results.  It's possible that a session could have responses spanning multiple pages of data. By default we assume that a session will be contained within a maximum of 3 pages of responses. You can adjust this number at the expense of memory consumption to increase reliability if a session is likely to span more pages.
 */
export async function fhirQuestionnaireResponsesFromFlowResultsResponseSet(
    fr: FlowResultsDataPackage, 
    frResponseSetPromise: Promise<AxiosResponse<FlowResultsResponseSet>>, 
    receiverFunction: (questionnaireResponses: R4.IQuestionnaireResponse[]) => any, 
    pagesToExamineForSessions = 3): Promise<void> {

    const fhirConverter = new FlowResultsToFHIRConverter(fr);
    let pageNum = -1;
    let frResponseSet: FlowResultsResponseSet;
    let nextResponseSetPromise = frResponseSetPromise;
    let shouldFinish = false;

    // Tracks the page where each session started
    const startPageToSessionIds = new Map<number, Array<string>>();
    // Holds the responses for each session
    const sessionIdToResponses = new Map<string, Array<FlowResultsResponse>>();

    // Iterate through pages of responses
    // eslint-disable-next-line no-constant-condition
    while(true) {
        pageNum = pageNum + 1;
        // console.log("Running page number: " + pageNum);
        startPageToSessionIds.set(pageNum, []);

        if(nextResponseSetPromise) {
            // Get responses on this page
            frResponseSet = await nextResponseSetPromise.then((r) => r.data);
            // Start fetching next page
            nextResponseSetPromise = frResponseSet.next(); 
        }
        else {
            shouldFinish = true;
        }

        // If nothing on this page, then we're done fetching all responses. Convert and push over everything we haven't processed yet
        if(shouldFinish || frResponseSet.responses.length == 0) {
            // console.log("Entered shouldFinish");
            const questionnaireResponses = [] as R4.IQuestionnaireResponse[];
            sessionIdToResponses.forEach((sessionArray) => {
                questionnaireResponses.push(fhirConverter.toQuestionnaireResponse(sessionArray));
            });
            sessionIdToResponses.clear();
            if(questionnaireResponses.length > 0) {
                receiverFunction(questionnaireResponses);
            }
            break;  // Done the while loop; have fetched responses from all pages
        }
        // console.log("    Found this many responses on that page: " + frResponseSet.responses.length);

        // For each response row received on this page: store it by sessionId
        frResponseSet.responses.forEach((responseRow) => {
            const sessionId = responseRow[FlowResultsResponseFields._SessionId] as string;
            
            // Already are tracking this session?
            if(sessionIdToResponses.has(sessionId)) {
                // Add responses within their session
                sessionIdToResponses.get(sessionId).push(responseRow);
            }
            // First time we see this session?
            else {
                startPageToSessionIds.get(pageNum).push(sessionId);
                sessionIdToResponses.set(sessionId, [responseRow]);
            }
        });

        // Is it time to process+evict any sessions for which we can assume we have all the responses by this page?
        if(pageNum >= pagesToExamineForSessions) {
            const pageToClear = pageNum - pagesToExamineForSessions;
            const questionnaireResponses = [] as R4.IQuestionnaireResponse[];
            startPageToSessionIds.get(pageToClear).forEach(sessionId => {
                questionnaireResponses.push(fhirConverter.toQuestionnaireResponse(sessionIdToResponses.get(sessionId)));
                sessionIdToResponses.delete(sessionId);
            });
            // Send converted QuestionnaireResponses to receiver, if we have any
            if(questionnaireResponses.length > 0) {
                receiverFunction(questionnaireResponses);
            }
            // We've processed all sessions that started on this page.
            startPageToSessionIds.delete(pageToClear);
        }
    }
}