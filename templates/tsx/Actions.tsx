import {
    CANCEL_EDIT,
    EDIT_BUY,
    EDIT_BUY_STEP2,
    EDIT_SELL,
    EDIT_SELL_STEP2,
    EDIT_TRANSFER,
    RATE_UPDATED,
    SAVE_EDIT, SETTINGS_UPDATED,
    TOKEN_SET, VIEW_HOME
} from "./Constants";

// redux actions
export function editBuy(step: number) {
    const action = {
        type: (step === 1 ? EDIT_BUY : EDIT_BUY_STEP2)
    };
    return action;
}

export function editSell(step: number) {
    const action = {
        type: (step === 1 ? EDIT_SELL : EDIT_SELL_STEP2)
    };
    return action;
}

export function cancelEdit() {
    const action = {
        type: CANCEL_EDIT
    };
    return action;
}

export function saveEdit() {
    const action = {
        type: SAVE_EDIT
    };
    return action;
}

export function view() {
    const action = {
        type: VIEW_HOME
    };
    return action;
}

export function editTransfer() {
    const action = {
        type: EDIT_TRANSFER
    };
    return action;
}

export function updateRate(data: any) {
    const action = {
        data,
        type: RATE_UPDATED
    };
    return action;
}

export function setToken(data: any) {
    const action = {
        token: data,
        type: TOKEN_SET
    };
    return action;
}

export function updateSettings(data: any) {
    const action = {
        data,
        type: SETTINGS_UPDATED
    };
    return action;
}
