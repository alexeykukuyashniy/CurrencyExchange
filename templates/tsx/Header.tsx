import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, NavLink} from "react-router-dom";
import Home from "./Home";
import Transactions from "./Transactions";
import Admin from "./Admin";
import RateService from "./RateService";
import {Provider} from "react-redux";
import store, {StoreUtils} from "./Store";
import CELogin from "./Login";
import { Redirect } from "react-router";
import CESubHeader from "./SubHeader";

interface IHeaderData {
    value: string;
    amount: string;
    date: string;
}

function isLoginPage() {
    return window.location.href.indexOf("login") > 0;
}

// main application component - container of all others
class CEHeader extends React.Component<{}, {}> {

    private unsubscribe: any;

    constructor(props: any) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.fetchData();
        this.unsubscribe = store.subscribe(this.handleStateChange);
    }

    public render() {
        const isVisible: string = !StoreUtils.isLoggedIn() ? "none" : "";

        if (!isLoginPage() && !StoreUtils.isLoggedIn()) {
            window.location.href = "/login"; // redirect to login page
        } else {
            return <>
                <img id="imgLogo" src="./static/images/logo.png" alt="Logo" style={{display: isVisible}}/>
                <div id="dvTitle" style={{display: isVisible}}>
                    <h2>
                        Airport Currency Exchange Office
                    </h2>
                </div>
                <Router>
                    <div id="dvLinks" style={{display: isVisible}}>
                        <ul>
                            <li>
                                <NavLink to="/home" activeClassName="selected">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/trans" activeClassName="selected">Transactions</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin" activeClassName="selected">Admin</NavLink>
                            </li>
                        </ul>
                    </div>
                    <CESubHeader/>
                    <div id="dvData">
                        {isLoginPage() && StoreUtils.isLoggedIn() ?
                            <Redirect to="/home"/> : ""
                        }
                        {!isLoginPage() && !StoreUtils.isLoggedIn() ?
                            <Redirect to="/login"/> : ""
                        }
                        <Route path="/" component={Home}/>
                        <Route path="/trans" component={Transactions}/>
                        <Route path="/admin" component={Admin}/>
                    </div>
                </Router>
                {isLoginPage() && !StoreUtils.isLoggedIn() ?
                    <CELogin/> : ""
                }
                {StoreUtils.isLoggedIn() ?
                    <RateService isGetRealData={false}/> : ""
                }
            </>;
        }
    }

    public componentWillUnmount(): void {
        this.unsubscribe();
    }

    private fetchData() {
        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        const that = this;

        fetch("./headerdata", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                console.log(response);
                const data = response.json();
                data.then((dt) => {
                    const d = (dt as IHeaderData[])[0];
                    console.log("header data: ", dt, d.amount, d.date, d.value);
                    const usdCashLocal: number = parseFloat(d.amount.replace(",", ""));

                    that.setState({
                        minimalCurrencyRest: d.value as unknown as number,
                        rateDate: d.date,
                        usdCash: usdCashLocal,
                        usdCashStr: d.amount
                    });
                });
            }
        });
    }

    private handleStateChange() {
        console.log("Header handleStateChange: ", StoreUtils.getStoreState(), store.getState());

        if (isLoginPage() && StoreUtils.isLoggedIn()) {
            console.log("forceUpdate");
            this.fetchData();
        }
    }
}

ReactDOM.render(
    <Provider store={store}>
        <CEHeader/>
    </Provider>,
    document.getElementById("header")
);
