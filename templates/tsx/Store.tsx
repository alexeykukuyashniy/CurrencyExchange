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

    public static getStoreState() {
        return (store.getState().main as IStoreState).state;
    }

    public static isLoggedIn() {
        return store.getState().security.token != undefined;
    };

    // return authorization header with jwt token
    public static authHeader() {
    if (StoreUtils.isLoggedIn()) {
        let st = store.getState().security;
        let token:string = (st != undefined  && st.token != undefined ? st.token.toString() : "");
        return { headers: {'Authorization': 'Bearer ' + token }};
    } else {
        return {};
    }
}
}

export default store;