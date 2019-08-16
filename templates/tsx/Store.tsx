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

export function getStoreState() {
    return (store.getState().main as IStoreState).state;
}

export function isLoggedIn() {
    return store.getState().security.token != undefined;
};

export default store;