import { fetch, addTask } from 'domain-task';
import { typeName, isActionType, Action, Reducer } from 'redux-typed';
import { ActionCreator } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AmazonProductsState {
    isLoading: boolean;
    startDateIndex: number;
    keywords: string;
    currency: string;
    response: AmazonResponse;
    currencies: Array<{ value: string, name: string }>;
}

export interface AmazonResponse {
    responseArray: AmazonProduct[];

    keywords: string;
    statusDescription: string;
    statusCode: string;

    isError: boolean;
    isFromCache: boolean;
}

export interface AmazonProduct {
    asin: string;
    productUrl: string;
    productImgUrl: string;
    title: string;
    price: string;
    offersUrl: string;
}

const defaultResponse: AmazonResponse = {
    responseArray: [],
    keywords: "",
    statusDescription: "",
    statusCode: "",
    isError: false,
    isFromCache: false
};

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

@typeName("REQUEST_AMAZON_PRODUCTS")
class RequestAmazonProducts extends Action {
    constructor(public keywords: string, public currency: string, public startDateIndex: number) {
        super();
    }
}

@typeName("RECEIVE_AMAZON_PRODUCTS")
class ReceiveAmazonProducts extends Action {
    constructor(public keywords: string, public currency: string, public startDateIndex: number, public response: AmazonResponse) {
        super();
    }
}

@typeName("REQUEST_CURRENCIES")
class RequestCurrencies extends Action {
    constructor() {
        super();
    }
}

@typeName("RECEIVE_CURRENCIES")
class ReceiveCurrencies extends Action {
    constructor(public currencies: Array<{ value: string, name: string }>) {
        super();
    }
}

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestProducts: (keywords: string, currency: string, startDateIndex: number): ActionCreator => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (startDateIndex !== getState().products.startDateIndex || keywords != getState().products.keywords || currency != getState().products.currency) {
            let fetchTask = fetch(`/api/amazonproducts/products?keywords=${keywords}&currency=${currency}&startDateIndex=${startDateIndex}`)
                .then(response => response.json())
                .then((data: AmazonResponse) => {
                    dispatch(new ReceiveAmazonProducts(keywords, currency, startDateIndex, data));
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch(new RequestAmazonProducts(keywords, currency, startDateIndex));
        }
    },
    requestCurrencies: (): ActionCreator => (dispatch, getState) => {
        if (getState().products.currencies.length == 0) {
            let fetchTask = fetch(`/api/currency/list`)
                .then(response => { return response.json() })
                //.then(response => dispatch(new ReceiveCurrencies([{ name: "USD", value: "USD" }])));
                .then((data: Array<{ value: string, name: string }>) => {
                    //dispatch(new ReceiveCurrencies([{ name: "USD", value: "USD" }]));
                    dispatch(new ReceiveCurrencies(data));
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch(new RequestCurrencies());
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.
const unloadedState: AmazonProductsState = {
    startDateIndex: null,
    keywords: null,
    currency: null,
    response: defaultResponse,
    isLoading: false,
    currencies: []
};

export const reducer: Reducer<AmazonProductsState> = (state, action) => {
    if (isActionType(action, RequestAmazonProducts)) {
        return {
            startDateIndex: action.startDateIndex,
            keywords: action.keywords,
            currency: action.currency,
            response: state.response,
            currencies: state.currencies,
            isLoading: true
        };
    } else if (isActionType(action, ReceiveAmazonProducts)) {
        // Only accept the incoming data if it matches the most recent request. This ensures we correctly
        // handle out-of-order responses.
        if (action.startDateIndex === state.startDateIndex && action.currency == state.currency && action.keywords == state.keywords) {
            return {
                startDateIndex: action.startDateIndex,
                keywords: action.keywords,
                currency: action.currency,
                response: action.response,
                currencies: state.currencies,
                isLoading: false
            };
        }
    } else if (isActionType(action, RequestCurrencies)) {
        return {
            startDateIndex: state.startDateIndex,
            keywords: state.keywords,
            currency: state.currency,
            response: state.response,
            currencies: state.currencies,
            isLoading: true
        };
    } else if (isActionType(action, ReceiveCurrencies)) {
        // Only accept the incoming data if it matches the most recent request. This ensures we correctly
        // handle out-of-order responses.
        return {
            startDateIndex: state.startDateIndex,
            keywords: state.keywords,
            currency: state.currency,
            response: state.response,
            currencies: action.currencies,
            isLoading: false
        };
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    // (or default initial state if none was supplied)
    return state || unloadedState;
};
