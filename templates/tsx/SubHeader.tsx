import * as React from "react";
import store, {StoreUtils} from "./Store";
import * as constants from "./Constants";

interface IHeaderData {
    amount: string;
    date: string;
    mincurrencyrest: string;
    refreshperiod: string;
}

export class CESubHeader extends React.Component<{}, {usdCash: number, rateDate: string,
                                              minimalCurrencyRest: number, refreshPeriod: number}> {

    private unsubscribe: any;
    private isDataLoaded: boolean = false;

    constructor(props: any) {
        super(props);
        this.state = {minimalCurrencyRest: 0, rateDate: "", refreshPeriod: 0, usdCash: 0};
        this.fetchData = this.fetchData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.unsubscribe = store.subscribe(this.handleStateChange);
        this.fetchData();
    }

    public isLoginPage() {
       return window.location.href.indexOf("login") > 0;
    }

    public render() {
        if (!this.isLoginPage() && (this.state.rateDate === null || this.state.rateDate === undefined)) {
            return "Loading...";
        }
        const isVisible: string = !StoreUtils.isLoggedIn() ? "none" : "";
        return (
            <div id="header2" style={{display: isVisible}}>
              <span>Exchange Rates shown as per <span
                  // tslint:disable-next-line
                  style={{color: this.state.refreshPeriod == 0 ? "red" : "black"}}
                  // tslint:disable-next-line
                  title={this.state.refreshPeriod == 0 ? "Currency exchange rates outdated!" : ""}>
                  {this.state.rateDate}</span>. You have <span
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
                    const usdCashLocal: number = parseFloat(d.amount.replace(",", ""));
                    that.setState({
                        minimalCurrencyRest: d.mincurrencyrest as unknown as number,
                        rateDate: d.date,
                        refreshPeriod: d.refreshperiod as unknown as number,
                        usdCash: usdCashLocal
                    });
                    this.isDataLoaded = true;
                    this.forceUpdate();
                });
            }
        });
    }

    private handleStateChange() {
        console.log("SubHeader handleStateChange: ", StoreUtils.getStoreState(), store.getState());

        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        if ((this.isLoginPage() || !this.isDataLoaded) && StoreUtils.isLoggedIn()) {
            this.fetchData();
            return;
        }

        if (StoreUtils.getStoreState() === constants.SAVE_EDIT) {
            this.fetchData(); // read from DB updated USD rest.
            return;
        }

        if (store.getState().main.data === undefined || store.getState().main.data.data === undefined) {
            return;
        }

        if (StoreUtils.getStoreState() === constants.SETTINGS_UPDATED) {
            const settings = store.getState().main.data.data as constants.ISettings;
            if (settings !== undefined) {
                const refreshPeriod: number = settings.refreshPeriod as unknown as number;
                if (refreshPeriod !== this.state.refreshPeriod) {
                    this.setState({refreshPeriod});
                }
            }
            return;
        }

        const rates = store.getState().main.data.data as constants.IRate[];
        if (rates === undefined) {
            return;
        } else if (rates[0] !== undefined && rates[0].date !== undefined) {
            console.log("SH rates:", rates);
            this.setState({rateDate: rates[0].date.substr(0, 19)});
            if (this.state.refreshPeriod === 0) {
                this.setState({refreshPeriod: 1});
            }
        }
    }
}

export default CESubHeader;
