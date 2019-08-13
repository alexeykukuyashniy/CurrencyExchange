
// db settings
export const COMMISSION = 'Commission';
export const SURCHARGE = 'Surcharge';
export const REFRESH_PERIOD = 'RefreshPeriod';
export const MINIMAL_COMMISSION = 'MinimalCommission';
export const BUY_SELL_RATE_MARGIN = 'BuySellRateMargin';
export const MINIMAL_CURRENCY_REST = 'MinimalCurrencyRest';

// redux actions & states
export const VIEW_HOME = 'VIEW_HOME';
export const EDIT_BUY = 'EDIT_BUY';
export const EDIT_BUY_STEP2 = 'EDIT_BUY_STEP2';
export const EDIT_SELL = 'EDIT_SELL';
export const EDIT_SELL_STEP2 = 'EDIT_SELL_STEP2';
export const CANCEL_EDIT = 'CANCEL_EDIT';
export const SAVE_EDIT = 'SAVE_EDIT';
export const EDIT_TRANSFER = 'EDIT_TRANSFER';
export const RATE_UPDATED = 'RATE_UPDATED';

// tarnsaction fields
export const TR_AMOUNT = 'Amount';
//export const TR_AMOUNT_USD = 'AmountUSD';
export const TR_RATE = 'Rate';
export const TR_TRANSACTION_TYPE = 'TransactionType'; // transaction type: 1 - buy, 2 - sell, 3 - send, 4 - receive
export const TR_CURRENCY_ID = 'CurrencyID';
export const TR_COMMISSION = 'Commission';

/*export const TR_OP_BUY = 1;
export const TR_OP_SELL = 2;
export const TR_OP_SEND = 3;
export const TR_OP_RECEIVE = 4;*/
export const enum TR_TRANSACTION_TYPES {BUY = 1, SELL = 2, SEND = 3, RECEIVE = 4};

export interface IStoreState{
    state : string;
    data:any|undefined;
}

export interface IRate {
    currencyid: number;
    code: string;
    namee: string|undefined;
    buyrate:number;
    sellrate:number;
    date:string;
    amount:number|undefined;
}