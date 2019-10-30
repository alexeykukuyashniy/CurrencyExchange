import { reducer as reduxFormReducer } from "redux-form";
import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {homeReducer, securityReducer} from "./Reducers";
import {EDIT_BUY, EDIT_BUY_STEP2, EDIT_SELL, EDIT_SELL_STEP2, IStoreState} from "./Constants";

const reducers = combineReducers({
    form: reduxFormReducer,
    main: homeReducer,
    security: securityReducer
});

const store = createStore (
    reducers, applyMiddleware(thunk)
);

// utilities class
export class StoreUtils {

    // returns main store state
    public static getStoreState() {
        return (store.getState().main as IStoreState).state;
    }

    // returns true if user logged in
    public static isLoggedIn() {
        return store.getState().security.token !== undefined;
    }

    // return authorization header with jwt token
    public static authHeader(withHeaders: boolean = true): {} {
        if (StoreUtils.isLoggedIn()) {
            const st = store.getState().security;
            const token: string = (st !== undefined && st.token !== undefined ? st.token.toString() : "");
            if (withHeaders) {
                return {headers: {Authorization: "Bearer " + token}};
            } else {
                return {Authorization: "Bearer " + token};
            }
        } else {
            return {};
        }
    }

    public static isBuy() {
        return (StoreUtils.getStoreState() === EDIT_BUY ||
                StoreUtils.getStoreState() === EDIT_BUY_STEP2);
    }

    public static isSell() {
        return (StoreUtils.getStoreState() === EDIT_SELL ||
                StoreUtils.getStoreState() === EDIT_SELL_STEP2);
    }
}

export default store;
