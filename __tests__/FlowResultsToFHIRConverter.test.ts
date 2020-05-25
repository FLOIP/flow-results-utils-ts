import { FlowResultsDataPackage, parse } from '../src/index'
import { fhirQuestionnaireFromFlowResults, fhirQuestionnaireResponseFromFlowResults } from '../src/index'

describe('Usage Examples', () => {

    test('MCQ only example', async () => {

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

        if(frPackage) {
            const fhirQuestionnaire = fhirQuestionnaireFromFlowResults(frPackage);
            // console.log(JSON.stringify(fhirQuestionnaire, null, 2));
            expect(fhirQuestionnaire).toEqual(expect.anything());
        }
    });

    test('Multiple data types example', async () => {

        const exampleFlowResultsPackage = 
            ` {
                "profile": "flow-results-package",
                "name": "flow_interop_social_demo",
                "flow_results_specification_version": "1.0.0-rc1",
                "created": "2019-04-09T22:49:54+00:00",
                "modified": "2020-05-18T02:00:42+00:00",
                "id": "5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65",
                "title": "Flow Interop Social Demo",
                "resources": [
                    {
                        "profile": "data-resource",
                        "name": "flow_interop_social_demo-data",
                        "path": null,
                        "access_method": "api",
                        "api-data-url": "https://go.votomobile.org/flow-results/packages/5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65/responses",
                        "mediatype": "application/vnd.api+json",
                        "encoding": "utf-8",
                        "schema": {
                            "language": "eng",
                            "fields": [
                                {
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
                                "q_1520727469077_84": {
                                    "type": "select_one",
                                    "label": "How interested and excited are you for increased interoperability in ICT4D?",
                                    "type_options": {
                                        "choices": [
                                            "🙄Not really",
                                            "🙂Little bit",
                                            "😃Lots",
                                            "😍OMG YES"
                                        ]
                                    }
                                },
                                "q_1520727585604_31": {
                                    "type": "numeric",
                                    "label": "How many months until you foresee the need to launch a project making use of Flow Interoperability?",
                                    "type_options": {
                                        "range": [
                                            -99,
                                            99
                                        ]
                                    }
                                },
                                "q_1520727871659_64": {
                                    "type": "open",
                                    "label": "Most important capability?",
                                    "type_options": {}
                                },
                                "q_1520739431185_81": {
                                    "type": "select_many",
                                    "label": "Where do you think Flow Interoperability support will be most useful?",
                                    "type_options": {
                                        "choices": [
                                            "Content and telecoms",
                                            "Crisis response times",
                                            "Data understanding"
                                        ]
                                    }
                                },
                                "q_1521915343920_16": {
                                    "type": "select_one",
                                    "label": "How can I help out today?",
                                    "type_options": {
                                        "choices": [
                                            "Know each other better",
                                            "Survey again",
                                            "Tell me a joke"
                                        ]
                                    }
                                },
                                "q_1521915979568_49": {
                                    "type": "select_one",
                                    "label": "Gender",
                                    "type_options": {
                                        "choices": [
                                            "👨Male",
                                            "👩Female",
                                            "🙂Other",
                                            "🤭Prefer not to say"
                                        ]
                                    }
                                },
                                "q_1521916104991_85": {
                                    "type": "numeric",
                                    "label": "Age",
                                    "type_options": {
                                        "range": [
                                            -99,
                                            99
                                        ]
                                    }
                                },
                                "q_1554851812087_23": {
                                    "type": "select_one",
                                    "label": "In the ICT4D ecosystem, what is your primary role?",
                                    "type_options": {
                                        "choices": [
                                            "Software vendor",
                                            "Development Implementer",
                                            "Humanitarian Responder",
                                            "Donor/Policy Maker",
                                            "None of these"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            }`;

        const frPackage = parse(FlowResultsDataPackage, JSON.parse(exampleFlowResultsPackage));

        if(frPackage) {
            const fhirQuestionnaire = fhirQuestionnaireFromFlowResults(frPackage);
            // console.log(JSON.stringify(fhirQuestionnaire, null, 2));
            expect(fhirQuestionnaire).toEqual(expect.anything());
        }
    });


    test('Session Conversion Example', async () => {

        const exampleFlowResultsPackage = 
            ` {
                "profile": "flow-results-package",
                "name": "flow_interop_social_demo",
                "flow_results_specification_version": "1.0.0-rc1",
                "created": "2019-04-09T22:49:54+00:00",
                "modified": "2020-05-18T02:00:42+00:00",
                "id": "5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65",
                "title": "Flow Interop Social Demo",
                "resources": [
                    {
                        "profile": "data-resource",
                        "name": "flow_interop_social_demo-data",
                        "path": null,
                        "access_method": "api",
                        "api-data-url": "https://go.votomobile.org/flow-results/packages/5fa40351-3c77-4e1d-b0fd-2e2dcd1d4b65/responses",
                        "mediatype": "application/vnd.api+json",
                        "encoding": "utf-8",
                        "schema": {
                            "language": "eng",
                            "fields": [
                                {
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
                                "q_1520727469077_84": {
                                    "type": "select_one",
                                    "label": "How interested and excited are you for increased interoperability in ICT4D?",
                                    "type_options": {
                                        "choices": [
                                            "🙄Not really",
                                            "🙂Little bit",
                                            "😃Lots",
                                            "😍OMG YES"
                                        ]
                                    }
                                },
                                "q_1520727585604_31": {
                                    "type": "numeric",
                                    "label": "How many months until you foresee the need to launch a project making use of Flow Interoperability?",
                                    "type_options": {
                                        "range": [
                                            -99,
                                            99
                                        ]
                                    }
                                },
                                "q_1520727871659_64": {
                                    "type": "open",
                                    "label": "Most important capability?",
                                    "type_options": {}
                                },
                                "q_1520739431185_81": {
                                    "type": "select_many",
                                    "label": "Where do you think Flow Interoperability support will be most useful?",
                                    "type_options": {
                                        "choices": [
                                            "Content and telecoms",
                                            "Crisis response times",
                                            "Data understanding"
                                        ]
                                    }
                                },
                                "q_1521915343920_16": {
                                    "type": "select_one",
                                    "label": "How can I help out today?",
                                    "type_options": {
                                        "choices": [
                                            "Know each other better",
                                            "Survey again",
                                            "Tell me a joke"
                                        ]
                                    }
                                },
                                "q_1521915979568_49": {
                                    "type": "select_one",
                                    "label": "Gender",
                                    "type_options": {
                                        "choices": [
                                            "👨Male",
                                            "👩Female",
                                            "🙂Other",
                                            "🤭Prefer not to say"
                                        ]
                                    }
                                },
                                "q_1521916104991_85": {
                                    "type": "numeric",
                                    "label": "Age",
                                    "type_options": {
                                        "range": [
                                            -99,
                                            99
                                        ]
                                    }
                                },
                                "q_1554851812087_23": {
                                    "type": "select_one",
                                    "label": "In the ICT4D ecosystem, what is your primary role?",
                                    "type_options": {
                                        "choices": [
                                            "Software vendor",
                                            "Development Implementer",
                                            "Humanitarian Responder",
                                            "Donor/Policy Maker",
                                            "None of these"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            }`;

        const frPackage = parse(FlowResultsDataPackage, JSON.parse(exampleFlowResultsPackage));

        const response = [
            ["2019-04-09T23:40:12+00:00","962496841403224064","962496826479890432","962496826597330944","q_1521915343920_16","Survey again",{}],
            ["2019-04-09T23:40:19+00:00","962497190767775744","962496826479890432","962496826597330944","q_1520727469077_84","😍OMG YES",{}],
            ["2019-04-09T23:40:29+00:00","962497220186624000","962496826479890432","962496826597330944","q_1520739431185_81","Data understanding",{}],
            ["2019-04-09T23:40:38+00:00","962497262641369088","962496826479890432","962496826597330944","q_1520727585604_31","3.0000",{}],
            ["2019-04-09T23:41:12+00:00","962497300541100032","962496826479890432","962496826597330944","q_1520727871659_64","Transformative, not just efficiency, improvements to implementers.",{"type": "text"}]
        ];

        if(frPackage) {
            const fhirQuestionnaire = fhirQuestionnaireFromFlowResults(frPackage);
            const fhirQuestionnaireResponse = fhirQuestionnaireResponseFromFlowResults(frPackage, response);
            // console.log(JSON.stringify(fhirQuestionnaire, null, 2));
            // console.log(JSON.stringify(fhirQuestionnaireResponse, null, 2));
            expect(fhirQuestionnaire).toEqual(expect.anything());
            expect(fhirQuestionnaireResponse).toEqual(expect.anything());
        }
    });

});