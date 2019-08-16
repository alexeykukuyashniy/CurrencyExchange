import * as React from 'react';
import * as ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import Home from './Home';
import Transactions from './Transactions';
import Admin from './Admin';
import RateService from './RateService';
import {Provider} from 'react-redux'
import store, {getStoreState, isLoggedIn} from './Store';
import CELogin from "./Login";
import { Redirect } from 'react-router';

interface IHeaderData {
    value: string;
    amount: string;
    date: string;
}

function isLoginPage(){
    return window.location.href.indexOf('login') > 0;
}

class CEHeader extends React.Component<{},{usdCash: number, usdCashStr: string, rateDate: string, minimalCurrencyRest:number}> {

    constructor(props: any) {
        super(props);
        this.state = {usdCash: 0, usdCashStr: '', rateDate: '', minimalCurrencyRest: 0};
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.fetchData();
        store.subscribe(this.handleStateChange);
    }

    fetchData() {
        if (!isLoggedIn())
            return;

        let that = this;

        fetch('./headerdata'
        ).then(function (response) {
            if (response.ok) {
                console.log(response);
                let data = response.json();
                data.then(data => {
                    let d = (data as IHeaderData[])[0];
                    console.log('header data: ', data, d.amount, d.date, d.value);
                    let usdCashLocal: number = parseFloat(d.amount.replace(",", ""));

                    that.setState({
                        usdCash: usdCashLocal, usdCashStr: d.amount,
                        rateDate: d.date, minimalCurrencyRest: d.value as unknown as number
                    });
                })
            }
        })
    }

    handleStateChange() {
        console.log('Header handleStateChange: ', getStoreState(), store.getState());

        if (isLoginPage() && isLoggedIn()) {
            console.log('forceUpdate');
            this.fetchData();
        }
    }

    render() {
        console.log('this.state.ratedate ', this.state.rateDate);

        let isVisible: string = !isLoggedIn() ? "none" : "";

        if (!isLoginPage() && !isLoggedIn()) {
            window.location.href = '/login'; // redirect to login page
        } else if (!isLoginPage() && (this.state.rateDate == null || this.state.rateDate == undefined)) {
            return 'Loading...';
        } else
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
                                <NavLink to="/" activeClassName="selected">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/trans" activeClassName="selected">Transactions</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin" activeClassName="selected">Admin</NavLink>
                            </li>
                        </ul>
                    </div>

                    <div id='header2' style={{display: isVisible}}>
                        <span>Exchange Rates shown as per {this.state.rateDate}. You have <span
                            style={{color: this.state.usdCash <= this.state.minimalCurrencyRest ? "red" : "black"}}>{this.state.usdCash}</span> USD left.</span>
                    </div>

                    <div id="dvData">
                        {isLoginPage() && isLoggedIn() ?
                            <Redirect to="/"/> : ""
                        }
                        {!isLoginPage() && !isLoggedIn() ?
                            <Redirect to="/login"/> : ""
                        }
                        <Route path='/' component={Home}/>
                        <Route path='/trans' component={Transactions}/>
                        <Route path='/admin' component={Admin}/>
                    </div>
                </Router>
                {isLoginPage() && !isLoggedIn() ?
                    <CELogin/> : ""
                }
                {isLoggedIn() ?
                    <RateService isGetRealData={false}/> : ""
                }
            </>
    }
}

    ReactDOM.render(
        <Provider store={store}>
            <CEHeader/>
        </Provider>,
        document.getElementById('header')
    );
