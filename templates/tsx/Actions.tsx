import {
    CANCEL_EDIT,
    EDIT_BUY,
    EDIT_BUY_STEP2,
    EDIT_SELL,
    EDIT_SELL_STEP2,
    EDIT_TRANSFER,
    RATE_UPDATED,
    SAVE_EDIT
} from "./Constants";
import { createStore } from 'redux';

export function editBuy(currencyid:number,step:number){
    const action = {
        type: (step == 1? EDIT_BUY : EDIT_BUY_STEP2),
        currencyid,
        step
    }
    return action;
}

export function editSell(currencyid:number,step:number){
    const action = {
        type: (step == 1? EDIT_SELL : EDIT_SELL_STEP2),
        currencyid,
        step
    }
    return action;
}

export function cancelEdit(){
    const action = {
        type:CANCEL_EDIT
    }
    return action;
}

export function saveEdit(){
    const action = {
        type: SAVE_EDIT
    }
    return action;
}

export function editTransfer(){
    const action = {
        type: EDIT_TRANSFER
    }
    return action;
}

export function updateRate(data:any){
    const action = {
        type: RATE_UPDATED,
        data: data
    }
    return action;
}