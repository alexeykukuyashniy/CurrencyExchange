import * as React from "react";
import store, {StoreUtils} from "./Store";
import * as constants from "./Constants";

interface IHeaderData {
    value: string;
    amount: string;
    date: string;
}

function isLoginPage() {
    return window.location.href.indexOf("login") > 0;
}

class CESubHeader extends React.Component<{}, {usdCash: number, rateDate: string,
                                              minimalCurrencyRest: number}> {

    private unsubscribe: any;

    constructor(props: any) {
        super(props);
        this.state = {usdCash: 0, rateDate: "", minimalCurrencyRest: 0};
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.unsubscribe = store.subscribe(this.handleStateChange);
        this.fetchData();
    }

    public render() {
        if (!isLoginPage() && (this.state.rateDate === null || this.state.rateDate === undefined)) {
            return "Loading...";
        }

        const isVisible: string = !StoreUtils.isLoggedIn() ? "none" : "";
        return (
            <div id="header2" style={{display: isVisible}}>
              <span>Exchange Rates shown as per {this.state.rateDate}. You have <span
                  style={{color: this.state.usdCash <= this.state.minimalCurrencyRest ? "red" : "black"}}>
                  {this.state.usdCash}</span> USD left.</span>
            </div>
        );
    }

    public componentWillUnmount(): void {
        console.log("CESubHeader componentWillUnmount");
        this.unsubscribe();
    }

    private fetchData() {
        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        const that = this;

        fetch("./headerdata", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((dat) => {
                    const d = (dat as IHeaderData[])[0];
                    console.log("subheader data: ", data, d.amount, d.date, d.value);
                    const usdCashLocal: number = parseFloat(d.amount.replace(",", ""));

                    that.setState({
                        minimalCurrencyRest: d.value as unknown as number,
                        rateDate: d.date,
                        usdCash: usdCashLocal
                    });
                });
            }
        });
    }

    private handleStateChange() {
        console.log("SubHeader handleStateChange: ", StoreUtils.getStoreState(), store.getState());

        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        if (isLoginPage() && StoreUtils.isLoggedIn()) {
            this.fetchData();
        }

        if (StoreUtils.getStoreState() === constants.SAVE_EDIT) {
            this.fetchData(); // read from DB updated USD rest.
            return;
        }

        if (store.getState().main.data === undefined || store.getState().main.data.data === undefined) {
            return;
        }

        const rates = store.getState().main.data.data as constants.IRate[];
        if (rates === undefined) {
            return;
        } else if (rates[0] !== undefined && rates[0].date !== undefined) {
            console.log("SH rates:", rates);
            this.setState({rateDate: rates[0].date.substr(0, 19)});
        }
    }
}

export default CESubHeader;
