/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/camelcase */
import {ArrayField, Field, RawJsonField, Rule, parse } from "sparkson"
export { parse } from "sparkson"

/**
 * Types of fields in a Data Packages Resource Table Schema. See https://specs.frictionlessdata.io/table-schema/#types-and-formats
 */
export type DataPackageSchemaFieldType = "datetime" | "string" | "any" | "object" | "number" | "integer" | "boolean" | "array" | "date" | "time" | "year" | "yearmonth" | "duration" | "geopoint" | "geojson";

/** 
 * Supported question types in Flow Results. See  https://floip.gitbook.io/flow-results-specification/specification#question-types 
 * */
export type FlowResultsQuestionType = "select_one" | "select_many" | "numeric" | "open" | "text" | "image" | "video" | "audio" | "geo_point" | "datetime" | "date" | "time";

/** Definition of a Flow Results Question */
export class FlowResultsQuestion {
    constructor(
        @Field("type") @Rule(validateQuestionType) public type: FlowResultsQuestionType,
        @Field("label") public label: string,
        @RawJsonField("type_options") public type_options: object
    ) {};
}

/** Fields in the Flow Results Schema */
export class FlowResultsSchemaField {
    constructor(
        @Field("name") public name: string,
        @Field("title") public title: string,
        @Field("type") @Rule(validateDataPackageFieldType) public type: DataPackageSchemaFieldType
    ) {};
}

// Validation
function validateSchemaFields(val): string {
    const fields : Array<FlowResultsSchemaField> = val;

    if(fields.length != 7) {
        return "Schema fields must use seven standard Flow Results fields.";
    }
    // TODO: Check contents of all fields
    return null;
}

function validateQuestionType(val): string {
    if(["select_one" ,  "select_many" ,  "numeric" ,  "open" ,  "text" ,  "image" ,  "video" ,  "audio" ,  "geo_point" ,  "datetime" ,  "date" ,  "time"].includes(val)) {
        return null;
    }
    return "Question type '" + val + "' not valid.";
}

function validateDataPackageFieldType(val): string {
    if(["datetime" , "string" , "any" , "object" , "number" , "integer" , "boolean" , "array" , "date" , "time" , "year" , "yearmonth" , "duration" , "geopoint" , "geojson"].includes(val)) {
        return null;
    }
    return "Data Package Field type '" + val + "' not valid.";
}


/** Flow Results Schema:
 * A Flow Results Resource must have a Table Schema. It extends Data Packages Table Schema to add a required set of FlowResultsQuestion `questions` that describe the meaning of the Flow Results.
 */
export class FlowResultsSchema {
    public questions = new Map<string, FlowResultsQuestion>();

    constructor(
        @Field("language", true) public language: string,
        @ArrayField("fields", FlowResultsSchemaField) @Rule(validateSchemaFields) public fields: Array<FlowResultsSchemaField>,
        @RawJsonField("questions") protected questionsRaw: object
    ) {
        for(const q in questionsRaw) {
            this.questions.set(q, parse(FlowResultsQuestion, questionsRaw[q]));
        }
    };

}



/**
 * Flow Results Resource: 
 * A Flow Results descriptor must have a single Flow Results Resource in its `resources` array.
 */
export class FlowResultsResource {
    constructor(
        @Field("profile") public profile: string,
        @Field("path", true) public path: string,
        @Field("api-data-url", true) public api_data_url: string,
        @Field("access_method", true) public access_method: string,
        @Field("mediatype") public mediatype: string,
        @Field("encoding") public encoding: string,
        @Field("schema") public schema: FlowResultsSchema
    ) {};
}


/** Data Package descriptor of Flow Results
 * See: https://floip.gitbook.io/flow-results-specification/specification#descriptor
 * Flow Results are compliant with the Data Packages upstream specification; see https://specs.frictionlessdata.io/data-package/
 * 
 */
export class FlowResultsDataPackage {    
    constructor(
        @Field("profile") public profile: string,
        @Field("name", true) public name: string | null,
        @Field("flow_results_specification_version") public flow_results_specification_version: string,
        @Field("created") public created: string,
        @Field("modified") public modified: string,
        @Field("id") public id: string,
        @Field("title", true) public title: string | null,
        @ArrayField("resources", FlowResultsResource) public resources: Array<FlowResultsResource>
    ) {}

    public resource() : FlowResultsResource { return this.resources[0]; }

}

/**
 * Describes the type of a "row" of Flow Results Responses, e.g.:
 * ["2019-04-09T23:40:12+00:00","962496841403224064","962496826479890432","962496826597330944","q_1521915343920_16","Female",{}]
 */
export type FlowResultsResponse = Array<string | number | object | []>;

/**
 * Describes the fields within a FlowResultsResponse. The numeric enum values correspond to the indexes in a FlowResultsResponse.
 */
export enum FlowResultsResponseFields {
    _Timestamp,
    _RowId,
    _ContactId,
    _SessionId,
    _QuestionId,
    _ResponseValue,
    _ResponseMetadata
}







