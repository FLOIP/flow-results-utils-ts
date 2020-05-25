/* eslint-disable @typescript-eslint/no-use-before-define */
import axios, { /*AxiosError,*/ AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { FlowResultsDataPackage, FlowResultsResponse } from '../models/FlowResultsDataPackage';
import { parse } from "sparkson";

export class FlowResultsClient {

    public ai: AxiosInstance;
    /**
     * Construct a Client instance
     * @param baseUrl Base URL of Flow Results server: e.g. https://go.votomobile.org/api/v1.  The "/flow-results/<endpoint>" will be appended; do not include the "/flow-results"
     * @param authHeader Example: "Token 0b79bab50daca910b000d4f1a2b675d604257e42", which will be set as the Authorization header.
     */
    constructor(baseUrl: string, authHeader: string) {

        this.ai = axios.create({
            baseURL: baseUrl,
            headers: {'Authorization': authHeader, 'Accept': 'application/vnd.api+json'}
        });

    }

    public getRaw(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.ai.get(url, config);
    }

    protected getPackages_(config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.getRaw('/flow-results/packages', config);
    }

    /**
     * Get the [list of Packages from the Flow Results server](https://floip.gitbook.io/flow-results-specification/api-specification#list-all-flow-results-packages)
     * @param config Axios request configuration
     */
    public getPackages(config?: AxiosRequestConfig): Promise<AxiosResponse> {
        const newConfig = {...config, transformResponse: (d: string) => {
            return JSON.parse(d).data;
        }};
        return this.getPackages_(newConfig);
    }

    /**
     * Get only an array of Package IDs from the Flow Results server.
     * This uses the same endpoint as above, but extracts just the package IDs into an array.
     * @param config 
     */
    public getPackagesIds(config?: AxiosRequestConfig): Promise<AxiosResponse<Array<string>>> {
        const newConfig = {...config, transformResponse: (d:string) => {
            return JSON.parse(d).data.map((p) => p.id);
        }};
        return this.getPackages_(newConfig);
    }

    /**
     * Get a [single Package descriptor from the Flow Results server](https://floip.gitbook.io/flow-results-specification/api-specification#get-the-descriptor-of-a-package)
     * @param id Flow Results Package ID
     * @param config Axios request configuration
     */
    public getPackage(id: string, config?: AxiosRequestConfig): Promise<AxiosResponse<FlowResultsDataPackage>> {
        const newConfig = {...config, transformResponse: (d: string) => {
            return parse(FlowResultsDataPackage, JSON.parse(d).data.attributes);
        }};
        return this.getRaw('/flow-results/packages/' + id, newConfig);
    }

    /**
     * Get the first page of [Responses for a Package from the Flow Results server](https://floip.gitbook.io/flow-results-specification/api-specification#get-responses-for-a-package)
     * @param frPackage Flow Results Descriptor
     * @param params Optional query parameters. An example would be:
     * { 
            'filter[start-timestamp]' : '2020-03-20 12:00:00',
            'page[size]': '2'
     *  }
     * @param config Axios request configuration
     */
    public getResponsesFromPackage(frPackage: FlowResultsDataPackage, params: object = {}, config?: AxiosRequestConfig): Promise<AxiosResponse<FlowResultsResponseSet>> {
        const newConfig = {...config, 
            params: params,
            transformResponse: (d: string) => {
                const fullData = JSON.parse(d);
                return new FlowResultsResponseSet(fullData.data.relationships,
                    fullData.data.attributes.responses,
                    this, params, config);
        }};

        if(frPackage.resource().access_method == "file") {
            throw new Error("Data access type 'file' cannot be retrieved.");
        }
        const url = frPackage.resource().api_data_url;

        return this.getRaw(url, newConfig);
    }

    /**
     * As an alternative to getResponsesFromPackage(), this can be used to fetch Flow Results Responses directly from an API URL.
     * @param apiDataUrl Full URL of the JSON:API URL where the Responses are located.
     * @param params Optional query parameters. An example would be:
     * { 
            'filter[start-timestamp]' : '2020-03-20 12:00:00',
            'page[size]': '2'
     *  }
     * @param config Axios request configuration
     */
    public getResponsesFromUrl(apiDataUrl: string, params: object, config?: AxiosRequestConfig): Promise<AxiosResponse<FlowResultsResponseSet>> {
        const newConfig = {...config, 
            params: params,
            transformResponse: (d: string) => {
                const fullData = JSON.parse(d);
                return new FlowResultsResponseSet(fullData.data.relationships,
                    fullData.data.attributes.responses,
                    this, params, config);
        }};

        return this.getRaw(apiDataUrl, newConfig);
    }
}

/**
 * Describes the return value of getResponsesFromPackage().  A FlowResultsResponseSet contains the data from the page (in responses), as well as the ability to fetch next() and previous() pages.
 */
export class FlowResultsResponseSet {
    constructor(
        public relationships,
        public responses: Array<FlowResultsResponse>,
        public client: FlowResultsClient,
        public originalParams: object,
        public originalConfig: AxiosRequestConfig
    ) {}

    public next(): Promise<AxiosResponse<FlowResultsResponseSet>> {
        if(this.relationships.links.next !== undefined && this.relationships.links.next !== null) {
            return this.client.getResponsesFromUrl(this.relationships.links.next, this.originalParams, this.originalConfig);
        }
        else {
            return null;
        } 
    }

    public previous(): Promise<AxiosResponse<FlowResultsResponseSet>> {
        if(this.relationships.links.previous !== undefined && this.relationships.links.previous !== null) {
            return this.client.getResponsesFromUrl(this.relationships.links.previous, this.originalParams, this.originalConfig);
        }
        else {
            return null;
        } 
    }

}
