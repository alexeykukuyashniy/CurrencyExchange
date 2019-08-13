import * as React from 'react';
import * as ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import Home from './Home';
import Transactions from './Transactions';
import Admin from './Admin';
import RateService from './RateService';
import {Provider} from 'react-redux'
import store, {getStoreState} from './Store';
import {IRate} from "./Constants";

interface IHeaderData {
    value: string;
    amount: string;
    date: string;
}

class CEHeader extends React.Component<{},{usdCash: number, usdCashStr: string, rateDate: string, minimalCurrencyRest:number}> {

    constructor(props: any) {
        super(props);
        this.state = {usdCash: 0, usdCashStr: '', rateDate: '', minimalCurrencyRest:0};
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.fetchData();
    }

    fetchData() {
        let that = this;

        fetch('./headerdata'
        ).then(function (response) {
            if (response.ok) {
                console.log(response);
                let data = response.json();
                data.then(data => {
                    let d = (data as IHeaderData[])[0];
                    console.log('header data: ', data, d.amount, d.date, d.value);
                    let usdCash:number = parseFloat(d.amount.replace(",",""));

                    that.setState({usdCash: usdCash, usdCashStr: d.amount,
                        rateDate: d.date, minimalCurrencyRest:d.value as unknown as number});
                })
            }
        })
    }

    handleStateChange() {
        console.log('Header handleStateChange: ', getStoreState(), store.getState());
        console.log(store.getState().home);
        console.log(store.getState().home.data);
        console.log(store.getState().home.data.data);

        if (store.getState().home == undefined || store.getState().home.data == undefined || store.getState().home.data.data == undefined) {
            console.log('no data. exiting 1');
            return;
        }
        let rates = store.getState().home.data.data as IRate[];
        if (rates == undefined) {
            console.log('no data. exiting 2');
            return;
        } else {
            this.setState({rateDate: rates[0].date.substr(0, 19)});
        }
    }

    render() {
        console.log('this.state.ratedate ', this.state.rateDate);
        if (this.state.rateDate == null || this.state.rateDate == undefined) {
            return 'Loading...';
        } else
            return <>
                <img id="imgLogo" src="./static/images/logo.png" alt="Logo"/>
                <div id="dvTitle">
                    <h2>
                        Airport Currency Exchange Office
                    </h2>
                </div>

                <Router forceRefresh={true}>
                    <div id="dvLinks">
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

                    <div id='header2'>
                        <span>Exchange Rates shown as per {this.state.rateDate}. You have <span style={{color:this.state.usdCash <= this.state.minimalCurrencyRest?"red":"black"}}>{this.state.usdCash}</span> USD left.</span>
                    </div>

                    <div id="dvData">
                        <Route path='/' component={Home}/>
                        <Route path='/trans' component={Transactions}/>
                        <Route path='/admin' component={Admin}/>
                    </div>
                </Router>
            </>
    }
}

/* <RateService isGetRealData={false}/>*/
   ReactDOM.render(
     <Provider store={store}>
       <CEHeader/>
         <RateService isGetRealData={false}/>
     </Provider>,
     document.getElementById('header')
   );
