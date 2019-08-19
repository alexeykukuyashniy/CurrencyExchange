import * as React from 'react';
import store, {StoreUtils} from './Store';
import * as constants from "./Constants";

interface IHeaderData {
    value: string;
    amount: string;
    date: string;
}
function isLoginPage(){
    return window.location.href.indexOf('login') > 0;
}

class CESubHeader extends React.Component<{},{usdCash: number, usdCashStr: string, rateDate: string, minimalCurrencyRest:number}> {

    unsubscribe: any;

    constructor(props: any) {
        super(props);
        this.state = {usdCash: 0, usdCashStr: '', rateDate: '', minimalCurrencyRest: 0};
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.unsubscribe = store.subscribe(this.handleStateChange);

        this.fetchData();
    }

    componentWillUnmount(): void {
        console.log('CESubHeader componentWillUnmount');
        this.unsubscribe();
    }

    fetchData() {
        if (!StoreUtils.isLoggedIn())
            return;

        let that = this;

        fetch('./headerdata', StoreUtils.authHeader()
        ).then(function (response) {
            if (response.ok) {
                console.log(response);
                let data = response.json();
                data.then(data => {
                    let d = (data as IHeaderData[])[0];
                    console.log('subheader data: ', data, d.amount, d.date, d.value);
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
        console.log('SubHeader handleStateChange: ', StoreUtils.getStoreState(), store.getState());

        if (!StoreUtils.isLoggedIn() || StoreUtils.getStoreState() == constants.SETTINGS_UPDATED) {
            return;
        }

        if (isLoginPage() && StoreUtils.isLoggedIn()) {
            console.log('forceUpdate');
            this.fetchData();
        }

        if (StoreUtils.getStoreState() == constants.SAVE_EDIT) {
            this.fetchData(); // read from DB updated USD rest.
            return;
        }

        if (store.getState().main.data == undefined || store.getState().main.data.data == undefined) {
            console.log('no data. exiting 1');
            return;
        }
        let rates = store.getState().main.data.data as constants.IRate[];
        if (rates == undefined) {
            console.log('no data. exiting 2');
            return;
        } else {
            console.log('SH rates:', rates);
            this.setState({rateDate: rates[0].date.substr(0, 19)});
        }
    }

    render() {
        if (!isLoginPage() && (this.state.rateDate == null || this.state.rateDate == undefined)) {
            return 'Loading...';
        }
        let isVisible: string = !StoreUtils.isLoggedIn() ? "none" : "";
        return (
            <div id='header2' style={{display: isVisible}}>
              <span>Exchange Rates shown as per {this.state.rateDate}. You have <span
                  style={{color: this.state.usdCash <= this.state.minimalCurrencyRest ? "red" : "black"}}>{this.state.usdCash}</span> USD left.</span>
            </div>
        )
    }
}

export default CESubHeader;