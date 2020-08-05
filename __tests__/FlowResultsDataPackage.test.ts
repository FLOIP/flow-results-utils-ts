import { FlowResultsDataPackage, parse } from '../index'

describe('Import and Validation', () => {

    test('Example Import', () => {

        const exampleFlowResultsPackage = 
            `{
                "profile": "flow-results-package",
                "name": "covid_19_self_assessment_sask",
                "flow_results_specification_version": "1.0.0-rc1",
                "created": "2020-03-19T23:36:33+00:00",
                "modified": "2020-03-20T04:21:40+00:00",
                "id": "9b3fc9d8-1736-4d79-9467-326d6fa57922",
                "title": "COVID-19 self-assessment - Sask",
                "resources": [{
                    "profile": "data-resource",
                    "name": "covid_19_self_assessment_sask-data",
                    "path": null,
                    "api-data-url": "https://go.votomobile.org/flow-results/packages/9b3fc9d8-1736-4d79-9467-326d6fa57922/resources",
                    "mediatype": "application/vnd.api+json",
                    "encoding": "utf-8",
                    "schema": {
                        "language": "eng",
                        "fields": [{
                                "name": "timestamp",
                                "title": "Timestamp",
                                "type": "datetime"
                            },
                            {
                                "name": "row_id",
                                "title": "Row ID",
                                "type": "string"
                            },
                            {
                                "name": "contact_id",
                                "title": "Contact ID",
                                "type": "string"
                            },
                            {
                                "name": "session_id",
                                "title": "Session ID",
                                "type": "string"
                            },
                            {
                                "name": "question_id",
                                "title": "Question ID",
                                "type": "string"
                            },
                            {
                                "name": "response",
                                "title": "Response",
                                "type": "any"
                            },
                            {
                                "name": "response_metadata",
                                "title": "Response Metadata",
                                "type": "object"
                            }
                        ],
                        "questions": {
                            "q_1584240952765_40": {
                                "type": "select_one",
                                "label": "Are you experiencing any of the following: \\n- severe difficulty breathing (e.g., struggling for each breath, speaking in single words)\\n- severe chest pain\\n- having a very hard time waking up\\n- feeling confused\\n- lost consciousness",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241107949_71": {
                                "type": "select_one",
                                "label": "Are you experiencing any of the following:\\n- short of breath at rest\\n- inability to lie down because of difficulty breathing\\n- chronic health conditions that you are having difficulty managing because of your current respiratory illness",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241238203_53": {
                                "type": "select_one",
                                "label": "The rest of this assessment will ask you questions to determine whether or not you will require COVID-19 testing.\\n\\nDo you have any of the following:\\n\\n- temperature greater than 38°C or 100.4°F\\n- cough\\n- shortness of breath",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241353792_57": {
                                "type": "select_one",
                                "label": "Were you exposed to someone who has been confirmed as having COVID-19 within 14 days of your symptoms starting?",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241487480_13": {
                                "type": "select_one",
                                "label": "Did you travel outside Canada within 14 days of your symptoms starting?",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241568153_40": {
                                "type": "select_one",
                                "label": "Have you been in close contact with someone with respiratory illness in the past 14 days?\\nA close contact is defined as a person who:\\n- provided care for the individual, including healthcare workers, family members or other caregivers, or who had other similar close physical contact without consistent and appropriate use of personal protective equipment OR\\n- who lived with or otherwise had close prolonged contact (within 2 meters) with the person while they were infectious OR\\n- had direct contact with infectious bodily fluids of the person (e.g. was coughed or sneezed on) while not wearing recommended personal protective equipment",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584241611915_16": {
                                "type": "select_one",
                                "label": "Had that person travelled outside of Canada within the past 14 days?",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584242064275_79": {
                                "type": "select_one",
                                "label": "In the past 14 days have you had close contact with someone who is confirmed as having COVID-19?\\nA close contact is defined as a person who:\\n- provided care for the individual, including healthcare workers, family members or other caregivers, or who had other similar close physical contact without consistent and appropriate use of personal protective equipment OR\\n- who lived with or otherwise had close prolonged contact (within 2 meters) with the person while they were infectious OR\\n- had direct contact with infectious bodily fluids of the person (e.g. was coughed or sneezed on) while not wearing recommended personal protective equipment",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            },
                            "q_1584242257634_79": {
                                "type": "select_one",
                                "label": "In the past 14 days have you returned from travel to any other locations outside of Canada?\\nTravel includes passing through an airport.",
                                "type_options": {
                                    "choices": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            }
                        }
                    }
                }]
            }`;

        const frPackage = parse(FlowResultsDataPackage, JSON.parse(exampleFlowResultsPackage));
        // console.log(frPackage.resource().schema.questions);
        expect(frPackage).toEqual(expect.anything());

    });

});