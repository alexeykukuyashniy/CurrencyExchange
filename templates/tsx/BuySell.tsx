import * as React from "react";
import { Field, reduxForm, SubmissionError } from "redux-form";
import {
    BUY_SELL_RATE_MARGIN,
    COMMISSION,
    EDIT_BUY,
    EDIT_BUY_STEP2,
    EDIT_SELL,
    EDIT_SELL_STEP2,
    MINIMAL_COMMISSION,
    SURCHARGE,
    TR_TRANSACTION_TYPES,
    IRate
} from "./Constants";
import store, {StoreUtils} from "./Store";
import {cancelEdit, editBuy, editSell, saveEdit} from "./Actions";
import axios from "axios";

interface IFormData {
    amount: number;
}

interface ISetting {
    name: string;
    value: string;
}

interface IBuySellProps {
    rate: number;
    amount: number;
    currencycode: string;
    currencyid: number;
}

interface IBuySellState {
    rate: number;
    amount: number;
    amountRest: number;
    currencycode: string;
    currencyid: number;
    subtotal: number;
    total: number;
    commissionamount: number;
    commissionamountStr: string;
    settings: ISettings;
    step: number|undefined; // needed to refresh the form on back/next button click
}

interface ISettings {
    commission: number;
    surcharge: number;
    minimalCommission: number;
    buySellRateMargin: number;
}

// currency buy/sell edit form
class BuySell extends React.Component<IBuySellProps, IBuySellState> {

    private formData: IFormData = {amount: 0};
    private unsubscribe: any;

    constructor(props: IBuySellProps) {
        super(props);
        this.amountChange = this.amountChange.bind(this);
        this.calcTotals = this.calcTotals.bind(this);
        this.submit = this.submit.bind(this);
        this.fetchSettings = this.fetchSettings.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.backClick = this.backClick.bind(this);
        this.stepAction = this.stepAction.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.getAmountRest = this.getAmountRest.bind(this);

        this.state = {
            amount: props.amount,
            amountRest: 0,
            commissionamount: 0,
            commissionamountStr: "0",
            currencycode: props.currencycode,
            currencyid: props.currencyid,
            rate: props.rate,
            settings: {commission: 0, surcharge: 0, minimalCommission: 0, buySellRateMargin: 0},
            step: 0,
            subtotal: 0,
            total: 0
        };
        this.unsubscribe = store.subscribe(this.handleStateChange);
        this.fetchSettings();
        this.getAmountRest(props.currencycode);
    }

    public render() {
        return (<BuySellForm onSubmit={this.submit}
                             amountChange={this.amountChange}
                             cancelClick={this.cancelClick}
                             backClick={this.backClick}
                             currencycode={this.state.currencycode}
                             rate={this.state.rate}
                             amount={this.state.amount}
                             subtotal={this.state.subtotal}
                             commissionamountStr={this.state.commissionamountStr}
                             total={this.state.total}
                             step={this.state.step}
            />
        );
    }

    public componentWillUnmount(): void {
        this.unsubscribe();
    }

    private getAmountRest(code: string) {
        const that = this;
        fetch("./cashamount?code=" + (StoreUtils.isSell() ? code : "USD"), StoreUtils.authHeader())
            .then((response) => {
                if (response.ok) {
                    const data = response.json();
                    data.then((d) => {
                            const amount: number = parseFloat((d as Array<{ amount: string }>)[0].amount.
                            replace(",", ""));
                            that.setState({amountRest: amount});
                        }
                    );
                }
            });
    }

    private handleStateChange() {
        console.log("BS handleStateChange: ", StoreUtils.getStoreState(), store.getState());
        console.log(store.getState().main);

        if (StoreUtils.getStoreState() === EDIT_BUY_STEP2 ||
            StoreUtils.getStoreState() === EDIT_SELL_STEP2) {
            return;
        }

        if (store.getState().main === undefined || store.getState().main.data === undefined ||
            store.getState().main.data.data === undefined) {
            console.log("no data. exiting 1");
            return;
        }

        const rates = store.getState().main.data.data as IRate[];
        if (rates === undefined) {
            console.log("no data. exiting 2");
            return;
        }
        console.log("rates: ", rates);
        const currencyid = this.state.currencyid;
        let rate = 0;
        for (const r of rates) {
            // tslint:disable-next-line
            if (currencyid == r.currencyid) {
                rate = (StoreUtils.getStoreState() === EDIT_BUY ||
                StoreUtils.getStoreState() === EDIT_BUY_STEP2 ? r.buyrate : r.sellrate);
            }
        }

        console.log("found rate:", rate);
        try {
            this.setState({rate}, this.calcTotals);
        } catch (err) {
            console.log("ERROR: ", err);
        }
    }

    private fetchSettings() {
        const that = this;
        fetch("./settings", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                let commission: number = 0;
                let surcharge: number = 0;
                let minimalCommission: number = 0;
                let buySellRateMargin: number = 0;
                const data = response.json();
                data.then((d) => {
                    const settings = (d as ISetting[]);
                    for (const s of settings) {
                        console.log(s);

                        switch (s.name) {
                            case COMMISSION:
                                commission = s.value as unknown as number;
                                break;
                            case SURCHARGE:
                                surcharge = s.value as unknown as number;
                                break;
                            case MINIMAL_COMMISSION:
                                minimalCommission = s.value as unknown as number;
                                break;
                            case BUY_SELL_RATE_MARGIN:
                                buySellRateMargin = s.value as unknown as number;
                                break;
                        }
                    }

                    that.setState({
                        settings: {
                            buySellRateMargin,
                            commission,
                            minimalCommission,
                            surcharge
                        }
                    }, that.calcTotals);
                });
            }
        });
    }

    private validated(values: any) {
        let errors: string = "";
        console.log("validation:", this.state);

        this.formData = (values as IFormData);
        if (this.formData.amount < 10) {
            errors = errors + "Amount should not be less than 10. \n";
        }

        if (StoreUtils.isSell() && this.formData.amount > this.state.amountRest) {
            errors = errors + "Amount should not be greater than " + this.state.amountRest + ". \n";
        } else if (!StoreUtils.isSell() && this.state.subtotal > this.state.amountRest) {
            const amount: number = Math.round(this.state.amountRest / this.state.rate * 100) / 100;
            errors = errors + "Amount should not be greater than " + amount + ". \n";
        }

        if (errors.length > 0) {
            throw new SubmissionError({_error: errors});
            return false;
        }
        return true;
    }

    // change edit form step: 1 <-> 2
    private stepAction() {
        const step = StoreUtils.getStoreState() === EDIT_BUY ||
        StoreUtils.getStoreState() === EDIT_SELL ? 2 : 1;
        return StoreUtils.isBuy() ? editBuy(step) : editSell(step);
    }

    private submit(values: any) {
        // print the form values to the console
        console.log("submit");

        if ((StoreUtils.getStoreState() === EDIT_BUY ||
            StoreUtils.getStoreState() === EDIT_SELL)) {
            store.dispatch(this.stepAction());
            console.log(store.getState());
            this.setState({step: 2});
        } else if (this.validated(values)) {
            console.log("saving...", this.state, values);
            const op: number = (StoreUtils.getStoreState() === EDIT_BUY_STEP2 ?
                1 : 2); // TR_TRANSACTION_TYPES.BUY : TR_TRANSACTION_TYPES.SELL); - doesn't work

            console.log("params: ", op, ", ", this.state.amount, ", ", this.state.rate, ", ",
                this.state.currencyid, ", ", this.state.commissionamount);

            const data = {
                Amount: this.state.amount,
                Commission: this.state.commissionamount,
                CurrencyID: this.state.currencyid,
                Note: "", // N/A
                Rate: this.state.rate,
                TransactionType: op
            };

            axios.post("/transaction", data, StoreUtils.authHeader())
                .then((response) => {
                    console.log(response);
                    store.dispatch(saveEdit()); // return to grid
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    private calcTotals() {
        console.log("calc totals ", this.state.amount, " ", this.state.settings.commission, " ",
            this.state.settings.surcharge, " ", this.state.settings.minimalCommission);

        const subtotal = this.state.rate !== undefined ?
            Math.round(this.state.amount * this.state.rate * 100.0) / 100.0 : 0;
        console.log("subtotal:", subtotal);

        const commissionamount = Math.ceil(Math.max(parseFloat((subtotal *
            this.state.settings.commission / 100.0).toString()) +
            parseFloat(this.state.settings.surcharge.toString()),
            this.state.settings.minimalCommission) * 100.0) / 100.0;

        const commissionamountStr = Number(commissionamount).toFixed(2);
        console.log(commissionamount, commissionamountStr);

        const total = Math.round((subtotal + (StoreUtils.getStoreState() === EDIT_BUY ? -1 : 1) *
            commissionamount) * 100) / 100;
        this.setState({commissionamount, commissionamountStr, subtotal, total});
    }

    private amountChange(event: any) {
        const amount: number = event.target.value;
        this.setState({amount}, this.calcTotals);
    }

    private cancelClick(event: any) {
        store.dispatch(cancelEdit());
    }

    private backClick(event: any) {
        store.dispatch(this.stepAction());
        this.setState({step: 1});
    }
}

let BuySellForm = (props: any) => {
    // "step" - just passed inside to force form refresh
    const {error, handleSubmit, amountChange, cancelClick, backClick, currencycode, rate, amount, subtotal,
           commissionamountStr, total, step} = props;
    const op: string = (StoreUtils.isBuy() ? "Buy" : "Sell");

    return (<div id="dvData2">
            <form onSubmit={handleSubmit}>
                <div id="dvClose">
                    <img id="imgClose" src="./static/images/close.gif" alt="Close" onClick={props.cancelClick}  />
                </div>
                <table>
                    <tbody>
                    <tr id="trClose" />
                    <tr>
                        <td style={{color: "red", maxWidth: "20em"}} colSpan={2}>
                            {error && <strong>{error}</strong>}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <h6 style={{textAlign: "center"}}> {op} {currencycode}</h6>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="amount">Amount to {op}:</label>
                        </td>
                        <td align="right">
                            <Field
                                name="amount"
                                component="input"
                                type="number"
                                onChange={props.amountChange}
                                value={props.amount}
                                disabled={StoreUtils.getStoreState() === EDIT_BUY_STEP2 ||
                                          StoreUtils.getStoreState() === EDIT_SELL_STEP2}
                                style={{textAlign: "right"}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Exchange rate:</label>
                        </td>
                        <td align="right">
                            <label>{rate}</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Subtotal:</label>
                        </td>
                        <td align="right">
                            <label>{subtotal}</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Commission:</label>
                        </td>
                        <td align="right">
                            <label>{commissionamountStr}</label>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className="horizontal-rule"></div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Total:</label>
                        </td>
                        <td align="right">
                            <label>{total}</label>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{float: "right"}}>
                                <button type="button" onClick={props.cancelClick} style={{margin: "5px 5px"}}>Cancel
                                </button>
                                <button type="button" onClick={props.backClick} style={{margin: "5px 5px"}}
                                        hidden={StoreUtils.getStoreState() !== EDIT_BUY_STEP2 &&
                                                StoreUtils.getStoreState() !== EDIT_SELL_STEP2}>Back
                                </button>
                                <button type="submit" style={{margin: "5px 5px"}}>{op}</button>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
};

// @ts-ignore
BuySellForm = reduxForm({
    form: "buySell",
    initialValues: {amount: 100}
})(BuySellForm);

export default BuySell;
