﻿import { fetch, addTask } from 'domain-task';
import { typeName, isActionType, Action, Reducer } from 'redux-typed';
import { ActionCreator } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AmazonProductsState {
    isLoading: boolean;
    startDateIndex: number;
    response: AmazonResponse;
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

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

@typeName("REQUEST_AMAZON_PRODUCTS")
class RequestAmazonProducts extends Action {
    constructor(public startDateIndex: number) {
        super();
    }
}

@typeName("RECEIVE_AMAZON_PRODUCTS")
class ReceiveAmazonProducts extends Action {
    constructor(public startDateIndex: number, public response: AmazonResponse) {
        super();
    }
}

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestProducts: (startDateIndex: number): ActionCreator => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (startDateIndex !== getState().products.startDateIndex) {
            let fetchTask = fetch(`/api/AmazonProducts/Products?startDateIndex=${startDateIndex}`)
                .then(response => response.json())
                .then((data: AmazonResponse) => {
                    dispatch(new ReceiveAmazonProducts(startDateIndex, data));
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch(new RequestAmazonProducts(startDateIndex));
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.
const unloadedState: AmazonProductsState = { startDateIndex: null, response: { responseArray: [], keywords: "", statusDescription: "", statusCode: "", isError: false, isFromCache: false }, isLoading: false };
export const reducer: Reducer<AmazonProductsState> = (state, action) => {
    if (isActionType(action, RequestAmazonProducts)) {
        return { startDateIndex: action.startDateIndex, isLoading: true, response: state.response };
    } else if (isActionType(action, ReceiveAmazonProducts)) {
        // Only accept the incoming data if it matches the most recent request. This ensures we correctly
        // handle out-of-order responses.
        if (action.startDateIndex === state.startDateIndex) {
            return { startDateIndex: action.startDateIndex, response: action.response, isLoading: false };
        }
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    // (or default initial state if none was supplied)
    return state || unloadedState;
};
