/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { FlowResultsDataPackage, FlowResultsQuestion, FlowResultsResponseFields, FlowResultsResponse } from '../models/FlowResultsDataPackage';
import { R4 } from  '@ahryman40k/ts-fhir-types';

export class FlowResultsToFHIRConverter {

    constructor(public fr: FlowResultsDataPackage) {
    }

    /**
     * Convert a FlowResultsDataPackage Descriptor into a FHIR Questionnaire
     * Example reference: https://www.hl7.org/fhir/questionnaire.html
     * Structure: 
{
  "resourceType" : "Questionnaire",
  // from Resource: id, meta, implicitRules, and language
  // from DomainResource: text, contained, extension, and modifierExtension
  "url" : "<uri>", // Canonical identifier for this questionnaire, represented as a URI (globally unique)
  "identifier" : [{ Identifier }], // Additional identifier for the questionnaire
  "version" : "<string>", // Business version of the questionnaire
  "name" : "<string>", // C? Name for this questionnaire (computer friendly)
  "title" : "<string>", // Name for this questionnaire (human friendly)
  "derivedFrom" : [{ canonical(Questionnaire) }], // Instantiates protocol or definition
  "status" : "<code>", // R!  draft | active | retired | unknown
  "experimental" : <boolean>, // For testing purposes, not real usage
  "subjectType" : ["<code>"], // Resource that can be subject of QuestionnaireResponse
  "date" : "<dateTime>", // Date last changed
  "publisher" : "<string>", // Name of the publisher (organization or individual)
  "contact" : [{ ContactDetail }], // Contact details for the publisher
  "description" : "<markdown>", // Natural language description of the questionnaire
  "useContext" : [{ UsageContext }], // The context that the content is intended to support
  "jurisdiction" : [{ CodeableConcept }], // Intended jurisdiction for questionnaire (if applicable)
  "purpose" : "<markdown>", // Why this questionnaire is defined
  "copyright" : "<markdown>", // Use and/or publishing restrictions
  "approvalDate" : "<date>", // When the questionnaire was approved by publisher
  "lastReviewDate" : "<date>", // When the questionnaire was last reviewed
  "effectivePeriod" : { Period }, // When the questionnaire is expected to be used
  "code" : [{ Coding }], // Concept that represents the overall questionnaire
  "item" : [{ // C? Questions and sections within the Questionnaire
    "linkId" : "<string>", // R!  Unique id for item in questionnaire
    "definition" : "<uri>", // ElementDefinition - details for the item
    "code" : [{ Coding }], // C? Corresponding concept for this item in a terminology
    "prefix" : "<string>", // E.g. "1(a)", "2.5.3"
    "text" : "<string>", // Primary text for the item
    "type" : "<code>", // R!  group | display | boolean | decimal | integer | date | dateTime +
    "enableWhen" : [{ // Only allow data when
      "question" : "<string>", // R!  Question that determines whether item is enabled
      "operator" : "<code>", // R!  exists | = | != | > | < | >= | <=
      // answer[x]: Value for question comparison based on operator. One of these 10:
      "answerBoolean" : <boolean>
      "answerDecimal" : <decimal>
      "answerInteger" : <integer>
      "answerDate" : "<date>"
      "answerDateTime" : "<dateTime>"
      "answerTime" : "<time>"
      "answerString" : "<string>"
      "answerCoding" : { Coding }
      "answerQuantity" : { Quantity }
      "answerReference" : { Reference(Any) }
    }],
    "enableBehavior" : "<code>", // C? all | any
    "required" : <boolean>, // C? Whether the item must be included in data results
    "repeats" : <boolean>, // C? Whether the item may repeat
    "readOnly" : <boolean>, // C? Don't allow human editing
    "maxLength" : <integer>, // C? No more than this many characters
    "answerValueSet" : { canonical(ValueSet) }, // C? Valueset containing permitted answers
    "answerOption" : [{ // C? Permitted answer
      // value[x]: Answer value. One of these 6:
      "valueInteger" : <integer>,
      "valueDate" : "<date>",
      "valueTime" : "<time>",
      "valueString" : "<string>",
      "valueCoding" : { Coding },
      "valueReference" : { Reference(Any) },
      "initialSelected" : <boolean> // Whether option is selected by default
    }],
    "initial" : [{ // C? Initial value(s) when item is first rendered
      // value[x]: Actual value for initializing the question. One of these 12:
      "valueBoolean" : <boolean>
      "valueDecimal" : <decimal>
      "valueInteger" : <integer>
      "valueDate" : "<date>"
      "valueDateTime" : "<dateTime>"
      "valueTime" : "<time>"
      "valueString" : "<string>"
      "valueUri" : "<uri>"
      "valueAttachment" : { Attachment }
      "valueCoding" : { Coding }
      "valueQuantity" : { Quantity }
      "valueReference" : { Reference(Any) }
    }],
    "item" : [{ Content as for Questionnaire.item }] // C? Nested questionnaire items
  }]
}
    **/
    public toQuestionnaire(): R4.IQuestionnaire {

        const q: R4.IQuestionnaire = {} as R4.IQuestionnaire;
        q.resourceType = "Questionnaire";
        q.id = this.fr.id;
        // language?
        // meta?
        // text?
        // url: no; we don't know where it will be published yet
        q.version = this.fr.modified;
        q.name = this.fr.name;
        q.title = this.fr.title;
        q.status = R4.QuestionnaireStatusKind._active;
        // subjectType?
        q.date = this.fr.modified;
        q.item = [] as R4.IQuestionnaire_Item[];

        // Items, ie questions:
        this.fr.resource().schema.questions.forEach((frQ: FlowResultsQuestion, idString: string) => {
            q.item.push(this.flowResultsQuestionToFHIRQuestionnaireItem(frQ, idString));
        });

        return q;
    }

    /**
     * Convert an extract of FlowResults response rows to a FHIR QuestionnaireResponse. 
     * This requires having all of the response rows for a single session in this array. See TODO for converting a complete FlowResultsResponseSet to multiple QuestionnaireResponses
     * @param frSessionArray : An array of Flow Results responses (data rows) that contain all of the responses for one session / one QuestionnaireResponse. The Flow Results session_id and contact_id should be the same for all rows.
     * Example frSessionArray:
     * Columns are: 0 - Timestamp, 1 - Row/response ID, 2 - Contact ID, 3 - Session ID, 4 - Question ID, 5 - Response, 6 - Response Metadata (See: FlowResultsResponseFields)
     * [
        ["2019-04-09T23:40:12+00:00","962496841403224064","962496826479890432","962496826597330944","q_1521915343920_16","Survey again",{}],
        ["2019-04-09T23:40:19+00:00","962497190767775744","962496826479890432","962496826597330944","q_1520727469077_84","😍OMG YES",{}],
        ["2019-04-09T23:40:29+00:00","962497220186624000","962496826479890432","962496826597330944","q_1520739431185_81","Data understanding",{}],
        ["2019-04-09T23:40:38+00:00","962497262641369088","962496826479890432","962496826597330944","q_1520727585604_31","3.0000",{}],
        ["2019-04-09T23:41:12+00:00","962497300541100032","962496826479890432","962496826597330944","q_1520727871659_64","Transformative, not just efficiency, improvements to implementers.",{"type": "text"}]
     * ]
     */
    public toQuestionnaireResponse(
        frSessionArray: Array<FlowResultsResponse>,
        subjectFormatter: (response: FlowResultsResponse, fr: FlowResultsDataPackage) => R4.IReference = this.defaultSubjectReference
        ) : R4.IQuestionnaireResponse {
        const fhirQR: R4.IQuestionnaireResponse = {} as R4.IQuestionnaireResponse;
        fhirQR.resourceType = "QuestionnaireResponse";
        // ID: We use the concatenation of FR Package Id and Response Session ID. This could be replaced with a callback function that is passed in, to allow users to control the ID that is used.
        fhirQR.id = this.fr.id + '-' + frSessionArray[0][FlowResultsResponseFields._SessionId];
        fhirQR.status = R4.QuestionnaireResponseStatusKind._completed;
        fhirQR.subject = subjectFormatter(frSessionArray[0], this.fr);
        // Authored date: We use the timestamp of the last response
        fhirQR.authored = frSessionArray[frSessionArray.length - 1][FlowResultsResponseFields._Timestamp] as string;
        // Author: TODO

        // Items:
        fhirQR.item = frSessionArray.map((response) => {
            const frQ = this.fr.resource().schema.questions.get(response[FlowResultsResponseFields._QuestionId] as string);
            if(frQ === undefined) {
                throw new Error("A question with id '" + response[FlowResultsResponseFields._QuestionId] + "' not found in the Flow Results schema.");
            }
            return this.flowResultsResponseToFHIRQuestionnaireResponseItem(response, frQ);
        });

        return fhirQR;
    }

    /**
     * Convert a Flow Results Question to a FHIR Questionnaire Item
     * @param frQ The Flow Results Question to convert to (one or more) FHIR Questionnaire Items
     * @param idString The ID string of the Flow Results Question
     */

    protected flowResultsQuestionToFHIRQuestionnaireItem(frQ: FlowResultsQuestion, idString: string) : R4.IQuestionnaire_Item {
        const fhirQ: R4.IQuestionnaire_Item = {} as R4.IQuestionnaire_Item;
        fhirQ.linkId = idString;
        fhirQ.text = frQ.label;

        let frQChoices: [];
        
        switch(frQ.type) {
            case "select_one":
                frQChoices = frQ.type_options['choices'];
                fhirQ.type = R4.Questionnaire_ItemTypeKind._choice;
                fhirQ.answerOption = frQChoices.map(choice => {
                    return {
                        "valueCoding": {
                            "code": choice
                        }
                    }
                });
                break;

            case "select_many":
                frQChoices = frQ.type_options['choices'];
                fhirQ.type = R4.Questionnaire_ItemTypeKind._group;    // select_many represented as an explosion into a group of booleans
                fhirQ.item = frQChoices.map((choice, num) => {
                    return {
                        "linkId": fhirQ.linkId + '-' + (num+1),
                        "text": choice,
                        "type": R4.Questionnaire_ItemTypeKind._boolean
                    }
                });
                break;

            case "audio":
            case "image":
            case "video":
                fhirQ.type = R4.Questionnaire_ItemTypeKind._attachment;
                break;

            case "date":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._date;
                break;

            case "datetime":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._dateTime;
                break;

            case "geo_point":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._string;
                break;
                
            case "numeric":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._decimal;
                break;

            case "open":
            case "text":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._string;
                break;

            case "time":
                fhirQ.type =  R4.Questionnaire_ItemTypeKind._time;
                break;       
        }

        return fhirQ;
    }

    /**
     * Default formatter to generate the Subject reference in a QuestionnaireResponse. Implementations can inject a replacement for this version.
     * @param response : The Flow Results Response line for the first response in the session. SessionId and ContactId are available within.
     * @param fr The Flow Results data package, for context
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public defaultSubjectReference(response: FlowResultsResponse, _fr: FlowResultsDataPackage): R4.IReference {
        return {
            "id": response[FlowResultsResponseFields._ContactId] as string,
            "display": "Contact ID " + response[FlowResultsResponseFields._ContactId]
        };
    }

    /**
     * Convert a single Flow Results Response row to a FHIR QuestionnaireResponse Item
     * @param response 
     * @param frQ 
     */
    protected flowResultsResponseToFHIRQuestionnaireResponseItem(response: FlowResultsResponse, frQ: FlowResultsQuestion) : R4.IQuestionnaireResponse_Item {
        const item: R4.IQuestionnaireResponse_Item = {} as R4.IQuestionnaireResponse_Item;
        const idString : string = response[FlowResultsResponseFields._QuestionId] as string;
        item.linkId = idString;
        item.text = frQ.label;

        let frQChoices: [];
        let responseChoicesChosen: [];
        
        switch(frQ.type) {
            case "select_one":
                item.answer = [{"valueCoding": {"code": response[FlowResultsResponseFields._ResponseValue] as string}}];
                break;

            case "select_many":
                frQChoices = frQ.type_options['choices'];
                responseChoicesChosen = response[FlowResultsResponseFields._ResponseValue] as [];

                // select_many represented as an explosion into a group of booleans
                item.item = frQChoices.map((choice, num) => {
                    return {
                        "linkId": idString + '-' + (num+1),
                        "text": choice,
                        "answer": [
                            {
                                "valueBoolean": responseChoicesChosen.includes(choice)
                            }
                        ]
                    }
                });
                break;

            case "audio":
            case "image":
            case "video":
                item.answer =  [{"valueAttachment": {"url": response[FlowResultsResponseFields._ResponseValue] as string}}];
                break;

            case "date":
                item.answer =  [{"valueDate": response[FlowResultsResponseFields._ResponseValue] as string}];
                break;

            case "datetime":
                item.answer =  [{"valueDateTime": response[FlowResultsResponseFields._ResponseValue] as string}];
                break;

            case "geo_point":
                item.answer =  [{"valueString": response[FlowResultsResponseFields._ResponseValue] as string}];
                break;
                
            case "numeric":
                item.answer =  [{"valueDecimal": response[FlowResultsResponseFields._ResponseValue] as number}];
                break;

            case "open":
            case "text":
                item.answer =  [{"valueString": response[FlowResultsResponseFields._ResponseValue] as string}];
                break;

            case "time":
                item.answer =  [{"valueTime": response[FlowResultsResponseFields._ResponseValue] as string}];
                break;       
        }

        return item;
    }

}

export function fhirQuestionnaireFromFlowResults(fr: FlowResultsDataPackage): R4.IQuestionnaire {
    const converter = new FlowResultsToFHIRConverter(fr);
    return converter.toQuestionnaire();
}

export function fhirQuestionnaireResponseFromFlowResults(fr: FlowResultsDataPackage, frSessionArray: Array<FlowResultsResponse>): R4.IQuestionnaireResponse {
    const converter = new FlowResultsToFHIRConverter(fr);
    return converter.toQuestionnaireResponse(frSessionArray);
}