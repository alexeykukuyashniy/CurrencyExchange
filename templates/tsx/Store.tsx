import { reducer as reduxFormReducer } from 'redux-form';
import { combineReducers, createStore } from 'redux';
import {homeReducer, securityReducer} from './Reducers';
import {IStoreState} from "./Constants";

let reducers = combineReducers({
    form: reduxFormReducer,
    main: homeReducer,
    security: securityReducer
});

const store = createStore(
    reducers,{}, undefined
);

export class StoreUtils {
   // private static _prevMainState:string = '';

    //public static prevMainState:string;

    public static getStoreState() {
        return (store.getState().main as IStoreState).state;
    }

    public static isLoggedIn() {
        return store.getState().security.token != undefined;
    };
}

export default store;