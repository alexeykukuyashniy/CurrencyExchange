import { reducer as reduxFormReducer } from 'redux-form';
import { Provider, connect } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {homeReducer} from './Reducers';
import {IStoreState} from "./Constants";

let reducers = combineReducers({
    form: reduxFormReducer,
    home: homeReducer
});

const store = createStore(
    reducers,{}, undefined
);

/*interface IStoreState{
    state : string;
    data:any|undefined;
}*/

export function getStoreState() {
    return (store.getState().home as IStoreState).state;
}

export default store;