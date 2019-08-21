import * as React from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import Transfer from "./Transfer";
import BuySell from "./BuySell";
import {editBuy, editSell, editTransfer, view} from "./Actions";
import store, {StoreUtils} from "./Store";
import * as constants from "./Constants";

const OpAttr: string = "op";
const CurrencyIDAttr: string = "currencyid";
const CurrencyCodeAttr: string = "currencycode";
const RateAttr: string = "rate";

class Home extends React.Component<{}, {rates: constants.IRate[]|undefined, rate: number,
                                        currencyid: number, currencycode: string, minimalCurrencyRest: number}> {

    private unsubscribe: any;

    constructor(props: any) {
        super(props);
        this.buySellClick = this.buySellClick.bind(this);
        this.buyTemplate = this.buyTemplate.bind(this);
        this.sellTemplate = this.sellTemplate.bind(this);
        this.transferTemplate = this.transferTemplate.bind(this);
        this.transferClick = this.transferClick.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.isViewMode = this.isViewMode.bind(this);
        this.buySellTemplate = this.buySellTemplate.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getSetting = this.getSetting.bind(this);

        this.state = {
            currencycode: "",
            currencyid: 0,
            minimalCurrencyRest: 0,
            rate: 0,
            rates: []
        };

        this.unsubscribe = store.subscribe(this.handleStateChange);
        store.dispatch(view()); // set to VIEW_HOME state

        this.fetchData();
        this.getSetting();
    }

    public render() {
        const url = window.location.href;

        // don"t render if not on Home page
        if (url.indexOf("login") > 0 || url.indexOf("trans") > 0 || url.indexOf("admin") > 0) {
            return "";
        }

        console.log("About to render Home");
        console.log("store.main: ", store.getState().main);
        console.log("store.security: ", store.getState().security);

        if (StoreUtils.isLoggedIn() && (this.state.rates === undefined || this.state.rates.length === 0)) {
            this.fetchData();
            return (<div id="dvHome">Loading ...</div>);
        } else if (this.state.rates && this.state.rates.length > 0) {
            console.log("rates: ", this.state.rates);
            console.log("store state: ", StoreUtils.getStoreState());
            const editForm = (StoreUtils.getStoreState() === constants.EDIT_BUY ||
                              StoreUtils.getStoreState() === constants.EDIT_SELL ?
                <BuySell rate={this.state.rate} amount={100} currencycode={this.state.currencycode}
                         currencyid={this.state.currencyid}/>
                : (StoreUtils.getStoreState() === constants.EDIT_TRANSFER ?
                    <Transfer amount={100} currencyid={this.state.currencyid}/> : ""));

            return (<div id="dvHome">
                    <DataTable value={this.state.rates}>
                        <Column field="name" header="Currency" style={{width: "13em"}}/>
                        <Column field="buyrate" header="Buy" body={this.buyTemplate}/>
                        <Column field="sellrate" header="Sell" body={this.sellTemplate}/>
                        <Column field="code" body={this.flagTemplate}/>
                        <Column field="amount" header="Amount" body={this.transferTemplate}/>
                    </DataTable>
                    <br/>
                    {editForm}
                </div>
            );
        } else {
            return ("");
        }
    }

    public componentWillUnmount(): void {
        this.unsubscribe();
    }

    private getSetting() {
        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        const that = this;
        fetch("./setting?name=" + constants.MINIMAL_CURRENCY_REST, StoreUtils.authHeader()
        ).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((d) => {
                    const minimalCurrencyRest = (d as Array<{ value: string }>)[0].value as unknown as number;
                    that.setState({minimalCurrencyRest});
                });
            }
        });
    }

    private fetchData() {
        console.log("fetch home rates: ", StoreUtils.isLoggedIn());
        if (!StoreUtils.isLoggedIn()) {
            return;
        }

        const that = this;
        fetch("./homerates", StoreUtils.authHeader()
        ).then((response) => {
            if (response.ok) {
                console.log("homerates: ", response);
                const data = response.json();
                data.then((d) => {
                    const rates = (d as constants.IRate[]);
                    console.log("rates: ", rates);
                    that.setState({rates}, that.switchToView);
                });
            }
        });
    }

    // switch to HOME_VIEW state
    private switchToView() {
        console.log("switchToView");
        if (StoreUtils.getStoreState() === constants.SAVE_EDIT) {
            store.dispatch(view());
        }
    }

    private flagTemplate(rowData: any, column: string) {
        const src: string = "./static/images/" + rowData.code.toLowerCase() + ".png";
        return <img src={src}/>;
    }

    private buySellClick(event: any) {
        const op: string = event.target.attributes[OpAttr].value;
        const currencycode: string = event.target.attributes[CurrencyCodeAttr].value;
        const currencyid: number = event.target.attributes[CurrencyIDAttr].value;
        const rate: number = event.target.attributes[RateAttr].value;

        store.dispatch(op === "buy" ? editBuy(1) : editSell(1)); // dispatch action
        this.setState({currencycode, rate, currencyid},
            () => {
                console.log("state: ", this.state);
                this.forceUpdate();
            });
    }

    private isViewMode() {
        const st = StoreUtils.getStoreState();
        return (st !== constants.EDIT_BUY && st !== constants.EDIT_BUY_STEP2 &&
                st !== constants.EDIT_SELL && st !== constants.EDIT_SELL_STEP2
               );
    }

    private buySellTemplate(rowData: any, rate: number, op: string) {
        return <Button type="button" onClick={this.buySellClick} op={op} currencyid={rowData.currencyid}
                       currencycode={rowData.code} rate={rate}
                       disabled={!this.isViewMode()}>
            {rate}
        </Button>;
    }

    private buyTemplate(rowData: any, column: string) {
        return this.buySellTemplate(rowData, rowData.buyrate, "buy");
    }

    private sellTemplate(rowData: any, column: string) {
        return this.buySellTemplate(rowData, rowData.sellrate, "sell");
    }

    private transferClick(event: any) {
        const currencyid = event.target.attributes[CurrencyIDAttr].value;
        const currencycode: string = event.target.attributes[CurrencyCodeAttr].value;
        store.dispatch(editTransfer());
        this.setState({currencycode, currencyid}, () => this.forceUpdate());
    }

    private transferTemplate(rowData: any, column: string) {
        return <Button type="button" onClick={this.transferClick} op="tr" currencyid={rowData.currencyid}
                       currencycode={rowData.code}
                       disabled={!this.isViewMode()}
                       className={parseFloat(rowData.amount) <= this.state.minimalCurrencyRest ? "btnRed" : ""}>
            {rowData.amount}
        </Button>;
    }

    private handleStateChange() {
        console.log("Home handleStateChange: ", StoreUtils.getStoreState(), store.getState());
        if (StoreUtils.getStoreState() === constants.SAVE_EDIT) {
            this.fetchData();
        } else if (StoreUtils.getStoreState() === constants.VIEW_HOME ||
                   StoreUtils.getStoreState() === constants.SETTINGS_UPDATED) {
            this.getSetting();
            this.forceUpdate();
        }
    }
}

export default Home;
