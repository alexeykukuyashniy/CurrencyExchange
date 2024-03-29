import { useState } from "react";
import {
    IStoreState,
    ISecurityStoreState,
    CANCEL_EDIT,
    RATE_UPDATED,
    SAVE_EDIT,
    VIEW_HOME,
    TOKEN_SET,
    NO_TOKEN, SETTINGS_UPDATED
} from "./Constants";

// const [prevState, setPrevState] = useState({state: VIEW_HOME, data: undefined}); // use State hook
let prevState: IStoreState = {state: VIEW_HOME, data: undefined};

export function homeReducer(state: IStoreState = {state: VIEW_HOME, data: undefined}, action: any) {

    // don"t touch system actions
    if (action.type.indexOf("redux") > 0 || action.type === TOKEN_SET) {
        return state;
    }

    let stateName: string = action.type;
    if (action.type === CANCEL_EDIT) {
        stateName = VIEW_HOME;
    } else if (action.type === RATE_UPDATED) {
        // don"t change state name on rate update - just add data
        stateName = prevState.state === SETTINGS_UPDATED ? VIEW_HOME : prevState.state;
    }

    const newState: IStoreState = {state: stateName, data: action};
    // setPrevState(newState);
    prevState = newState;
    return newState;
}

export function securityReducer(state: ISecurityStoreState = {state: NO_TOKEN, token: undefined}, action: any) {

    // don"t touch system actions
    if (action.type.indexOf("redux") > 0 || action.type !== TOKEN_SET || action.token === undefined) {
        return state;
    }

    const stateName: string = action.type;
    const newState: ISecurityStoreState = {state: stateName, token: action.token};
    return newState;
}
