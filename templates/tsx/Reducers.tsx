
import {
    CANCEL_EDIT,
    EDIT_BUY,
    EDIT_BUY_STEP2,
    EDIT_SELL,
    EDIT_SELL_STEP2,
    EDIT_TRANSFER, IStoreState, RATE_UPDATED,
    SAVE_EDIT,
    VIEW_HOME
} from "./Constants";
//import store from "./Store";

/*interface IStoreState{
    state : string;
    data:any|undefined;
}*/

let prevState : IStoreState = {state:VIEW_HOME,data:undefined};
export function homeReducer(state:IStoreState = {state:VIEW_HOME,data:undefined}, action:any) {

    console.log('old state name: ', prevState.state);
    console.log('action type: ', action.type);

    // don't touch system actions
    if (action.type.indexOf('redux') > 0 )
    {
        return state;
    }

    let stateName:string = action.type;
    if (action.type == CANCEL_EDIT ||  action.type == SAVE_EDIT)
    {
      stateName = VIEW_HOME;
    } else if (action.type == RATE_UPDATED)
    {
        stateName = prevState.state; // don't change state name on rate update - just add data
        console.log('leave state name as is: ', stateName);
    }

    let newState:IStoreState = {state:stateName, data:action};
    prevState = newState;
    console.log('new state:', newState);
    return newState;

    //----------------------------------------------
    console.log(prevState, newState);
 prevState = state;
    return {state:action.type, data:action};
 //let newState = RATE_UPDATED;
 return {state,action};
  return  Object.assign({}, newState, action);
    switch (action.type) {
        /*case EDIT_BUY:
         return EDIT_BUY;
        case EDIT_BUY_STEP2:
         return EDIT_BUY_STEP2;
        case EDIT_SELL:
         return EDIT_SELL;
        case EDIT_SELL_STEP2:
         return EDIT_SELL_STEP2;*/
  /*   case CANCEL_EDIT:
     case SAVE_EDIT:
      return VIEW_HOME;
      //newState = Object.assign( state= VIEW_HOME, action);
      break;*/
        /*case EDIT_TRANSFER:
         return EDIT_TRANSFER;
        case RATE_UPDATED:
         return {RATE_UPDATED,
                 action
                }*/
     default:
      return /*state
             action*/
             Object.assign(state, {action})
      //newState = Object.assign({},state = action.type, {action});
    }
    //prevState = newState;
   // return newState;
}
