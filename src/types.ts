/**
 * The type tabs.Tab contains information about a tab. This provides access to information about what content is in the tab, how large the content is, what special states or restrictions are in effect, and so forth.
 *
 * Note: In extension background scripts, the only properties that are available are tabId and windowId.
 */
export interface ITab {
    active: boolean;
    attention: boolean;
    id: number;
    status: string;
    title: string;
    /**
     * Optional
     *
     * The URL of the document that the tab is displaying. Only present if the extension has the "tabs" permission.
     */
    url: string;
}

export interface ITabs_CreateProperties {
    /**
     * Optional
     *
     * Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see windows.update). Defaults to true.
     */
    active: boolean;
    cookieStoreId: string;
    index: number;
    openerTabId: number;
    openInReaderMode: boolean;
    pinned: boolean;
    selected: boolean;
    url: string;
}

export interface IStorageArea {
    get(keys: null | string | object | string[]): Promise<object | undefined>;
    getTyped<T>(key: string): Promise<T>;
    set(model: object): Promise<void>;
    remove(keys: string | string[]): Promise<void>;
}

export interface IBrowserApiStorage {
    local: IStorageArea;
}

export interface IBrowserApiTabs {
    create(props: ITabs_CreateProperties): Promise<ITab>;
    remove(tabIds: number | number[]): Promise<void>;
}

export interface IBrowserApiIdentity {
    /**
     * Generates a URL that you can use as a redirect URL.
     */
    getRedirectUrl(): string;
    /**
     * Performs the first part of an OAuth2 flow, including user authentication and client authorization.
     * @param details Options for the flow
     * @returns A Promise. If the extension is authorized successfully, this will be fulfilled with a string containing the redirect URL. The URL will include a parameter that either is an access token or can be exchanged for an access token, using the documented flow for the particular service provider. 
     */
    launchWebAuthFlow(details: ILaunchWebAuthFlowDetails): Promise<string>;
}

export interface ILaunchWebAuthFlowDetails {
    url: string;
    interactive: boolean | undefined;
}

export interface IBrowserApiRuntime {
    /**
     * Send message to your extension
     * @param message An object that can be serialized to JSON.
     */
    sendMessage(message: any): Promise<object | void>;
}

export interface IBrowserApi {
    storage: IBrowserApiStorage;
    tabs: IBrowserApiTabs;
    identity: IBrowserApiIdentity;
    runtime: IBrowserApiRuntime;
}
