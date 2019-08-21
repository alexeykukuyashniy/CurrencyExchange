
// db settings
export const COMMISSION = "Commission";
export const SURCHARGE = "Surcharge";
export const REFRESH_PERIOD = "RefreshPeriod";
export const MINIMAL_COMMISSION = "MinimalCommission";
export const BUY_SELL_RATE_MARGIN = "BuySellRateMargin";
export const MINIMAL_CURRENCY_REST = "MinimalCurrencyRest";

// redux actions & states
export const VIEW_HOME = "VIEW_HOME";
export const EDIT_BUY = "EDIT_BUY";
export const EDIT_BUY_STEP2 = "EDIT_BUY_STEP2";
export const EDIT_SELL = "EDIT_SELL";
export const EDIT_SELL_STEP2 = "EDIT_SELL_STEP2";
export const CANCEL_EDIT = "CANCEL_EDIT";
export const SAVE_EDIT = "SAVE_EDIT";
export const EDIT_TRANSFER = "EDIT_TRANSFER";
export const RATE_UPDATED = "RATE_UPDATED";
export const TOKEN_SET = "TOKEN_SET";
export const NO_TOKEN = "NO_TOKEN";
export const SETTINGS_UPDATED = "SETTINGS_UPDATED";

export const enum TR_TRANSACTION_TYPES {BUY = 1, SELL = 2, SEND = 3, RECEIVE = 4}

export interface IStoreState {
    state: string;
    data: any|undefined;
}

export interface ISecurityStoreState {
    state: string;
    token: string|undefined;
}

export interface IRate {
    currencyid: number;
    code: string;
    namee: string|undefined;
    buyrate: number;
    sellrate: number;
    date: string;
    amount: number|undefined;
}

export interface ISettings {
    refreshPeriod: string;
    commission: string;
    surcharge: string;
    minimalCommission: string;
    buySellRateMargin: string;
}
