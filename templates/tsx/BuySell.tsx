import * as React from 'react';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { SubmissionError } from 'redux-form';
import { Field, reduxForm } from 'redux-form'
import * as constants from "./Constants";
import store, {StoreUtils} from './Store';
import {cancelEdit, editBuy, editSell, saveEdit} from "./Actions";
import axios from 'axios';

interface IFormData{
    amount:number;
}

interface ISettings {
    commission: number;
    surcharge: number;
    minimalCommission: number;
    buySellRateMargin:number;
}

interface setting {
    name: string;
    value: string;
}

interface BuySellProps{
    rate:number;
    amount:number;
    currencycode:string;
    currencyid:number;
}

interface BuySellState{
    rate:number;
    amount:number;
    amountRest:number;
    currencycode:string;
    currencyid:number;
    subtotal:number;
    total:number;
    commissionamount:number;
    settings:ISettings;
    step:number|undefined; // needed to refresh the form on back/next button click
}

   class BuySell extends React.Component<BuySellProps, BuySellState> {

       formData:IFormData = {amount:0};
       unsubscribe:any;

       constructor(props: BuySellProps) {
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
               rate: props.rate,
               amount: props.amount,
               amountRest: 0,
               currencycode: props.currencycode,
               currencyid: props.currencyid,
               commissionamount:0,
               subtotal:0,
               total:0,
               step:0,
               settings : {commission: 0, surcharge: 0, minimalCommission: 0, buySellRateMargin: 0}
           };
           this.unsubscribe = store.subscribe(this.handleStateChange);
           this.fetchSettings();
           this.getAmountRest(props.currencycode);
       }

       getAmountRest(code:string) {
           let that = this;
           fetch('./cashamount?code=' + (this.isSell() ? code : 'USD'), StoreUtils.authHeader()).then(function (response) {
               if (response.ok) {

                   let data = response.json();
                   data.then(data => {
                          console.log(data, (data as {amount:string}[])[0]);
                          let amount:number = parseFloat((data as {amount:string}[])[0].amount.replace(",",""));
                          that.setState({amountRest:amount});
                          console.log('amount rest:', amount);
                       }
                   );
               }
           });
       }

       componentWillUnmount(): void {
           console.log('componentWillUnmount');
           this.unsubscribe();
       }

       handleStateChange() {
           console.log('BS handleStateChange: ', StoreUtils.getStoreState(), store.getState());
           console.log(store.getState().main);
           console.log(store.getState().main.data);
           console.log(store.getState().main.data.data);

           if (StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 || StoreUtils.getStoreState() == constants.EDIT_SELL_STEP2)
           {
               return;
           }

           if (store.getState().main == undefined || store.getState().main.data == undefined || store.getState().main.data.data == undefined) {
               console.log('no data. exiting 1');
               return;
           }
           let rates = store.getState().main.data.data as constants.IRate[];
           if (rates == undefined) {
               console.log('no data. exiting 2');
               return;
           }
           console.log('rates: ', rates);
           let currencyid = this.state.currencyid;
           let rate = 0;
           for (let i: number = 0; i < rates.length; i++) {

               if (currencyid == rates[i].currencyid) {
                   rate = (StoreUtils.getStoreState() == constants.EDIT_BUY || StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 ? rates[i].buyrate : rates[i].sellrate);
               }
           }

           console.log('found rate:', rate);
           try {
               this.setState({rate: rate}, this.calcTotals);
           } catch(err)
           {
               console.log('ERROR: ', err);
           }
       }

       fetchSettings() {
           let that = this;
           fetch('./settings', StoreUtils.authHeader()).then(function (response) {
               if (response.ok) {
                   let commission: number = 0;
                   let surcharge: number = 0;
                   let minimalCommission: number = 0;
                   let buySellRateMargin: number = 0;
                   let data = response.json();
                   data.then(data => {
                       let settings = (data as setting[]);
                       for (let i = 0; i < settings.length; i++) {
                           console.log(settings[i]);

                           switch (settings[i].name) {
                               case constants.COMMISSION:
                                   commission = settings[i].value as unknown as number;
                                   break;
                               case constants.SURCHARGE:
                                   surcharge = settings[i].value as unknown as number;
                                   break;
                               case constants.MINIMAL_COMMISSION:
                                   minimalCommission = settings[i].value as unknown as number;
                                   break;
                               case constants.BUY_SELL_RATE_MARGIN:
                                   buySellRateMargin = settings[i].value as unknown as number;
                                   break;
                           }
                       }

                       that.setState({
                               settings: {
                               commission: commission,
                               surcharge: surcharge,
                               minimalCommission: minimalCommission,
                               buySellRateMargin : buySellRateMargin
                           }
                       }, that.calcTotals);
                       console.log('fecthed');
                   })
               }
           })
       }

       isSell(){
          return (StoreUtils.getStoreState() == constants.EDIT_SELL || StoreUtils.getStoreState() == constants.EDIT_SELL_STEP2);
       }

       validated(values:any) {
           let errors: string = "";
           console.log('validation:', this.state);

           this.formData = (values as IFormData);
           if (this.formData.amount < 10) {
               errors = errors + "Amount should not be less than 10. \n";
           }

           if (this.isSell() && this.formData.amount > this.state.amountRest)
           {
               console.log('sell');
               errors = errors + "Amount should not be greater than " + this.state.amountRest + ". \n";
           } else
           if (!this.isSell() && this.state.subtotal > this.state.amountRest) {
               console.log(this.state.amountRest ,' ', this.state.rate);
               let amount:number = Math.round(this.state.amountRest / this.state.rate * 100) / 100;
               errors = errors + "Amount should not be greater than " + amount + ". \n";
           }

           console.log('errors: ',errors)

           if (errors.length > 0) {
               throw new SubmissionError({_error: errors});
               return false;
           }
           return true;
       }

       // change edit form step: 1 <-> 2
       stepAction()
       {
           let step = StoreUtils.getStoreState() == constants.EDIT_BUY  || StoreUtils.getStoreState() == constants.EDIT_SELL? 2 : 1;
           return StoreUtils.getStoreState() == constants.EDIT_BUY || StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 ?
               editBuy(this.state.currencyid, step) :
               editSell(this.state.currencyid, step)
       }

       submit(values: any) {
           // print the form values to the console
           console.log('submit');

           if ((StoreUtils.getStoreState() == constants.EDIT_BUY || StoreUtils.getStoreState() == constants.EDIT_SELL)){
               store.dispatch(this.stepAction());
               console.log(store.getState());
               this.setState({step:2});
           } else
           if (this.validated(values))
           {
               console.log('saving...', this.state, values);
               console.log(constants.TR_TRANSACTION_TYPES.BUY);
               let op:number = (StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 ? constants.TR_TRANSACTION_TYPES.BUY : constants.TR_TRANSACTION_TYPES.SELL);

               console.log('params: ', op, ', ', this.state.amount, ', ', this.state.rate, ', ',  this.state.currencyid, ', ', this.state.commissionamount);

               let data = {
                   "TransactionType": op,
                   "Amount": this.state.amount,
                   "CurrencyID": this.state.currencyid,
                   "Rate": this.state.rate,
                   "Commission": this.state.commissionamount,
                   "Note": "" // N/A
               };

               axios.post('/transaction', data, StoreUtils.authHeader())
                   .then(function (response) {
                       console.log(response);
                       store.dispatch(saveEdit()); // return to grid
                   })
                   .catch(function (error) {
                       console.log(error);
                   });
           }
       }

       calcTotals() {
           console.log('calc totals ',this.state.amount,' ', this.state.settings.commission,' ', this.state.settings.surcharge, ' ',
               this.state.settings.minimalCommission);
           let commissionAmount = Math.ceil(Math.max(parseFloat((this.state.amount * this.state.settings.commission / 100.0).toString()) + parseFloat(this.state.settings.surcharge.toString()),
               this.state.settings.minimalCommission) * 100.0) / 100.0;
           console.log(commissionAmount);

           let subtotal = this.state.rate != undefined ? Math.round(this.state.amount * this.state.rate * 100.0) / 100.0 : 0;
           console.log('subtotal:', subtotal);
           let total = Math.round((subtotal + (StoreUtils.getStoreState() == constants.EDIT_BUY ? -1 : 1) * commissionAmount) * 100) / 100;
           this.setState({subtotal:subtotal, commissionamount:commissionAmount, total:total});
       }

       amountChange(event:any) {
           console.log('amount change');
           console.log('value:', event.target.value);
           let amount: number = event.target.value;
           if (amount >= 10) {
               this.setState({amount: amount}, this.calcTotals);
           }
       }

       cancelClick(event:any) {
           console.log('cancel clicked');
           store.dispatch(cancelEdit());
       }

       backClick(event:any) {
           console.log('back clicked');
           store.dispatch(this.stepAction());
           console.log(store.getState());
           this.setState({step:1});
       }

       render() {
           console.log('rendering BuySell')
           console.log(this.props);
           console.log(this.state);
           return (<BuySellForm onSubmit={this.submit}
                                amountChange={this.amountChange}
                                cancelClick={this.cancelClick}
                                backClick={this.backClick}
                                currencycode={this.state.currencycode}
                                rate={this.state.rate}
                                amount={this.state.amount}
                                subtotal={this.state.subtotal}
                                commissionamount = {this.state.commissionamount}
                                total = {this.state.total}
                                step = {this.state.step}
                   />
           )
       }
   }

let BuySellForm = (props:any) => {
    // "step" - just passed inside to force form refresh
    const {error, handleSubmit, amountChange, cancelClick, backClick, currencycode, rate, amount, subtotal, commissionamount, total, step} = props;
    console.log(props);
    console.log(props.currencycode);
    console.log(currencycode);
    console.log(amount);
    console.log(props.amount);
    console.log("store state: ", StoreUtils.getStoreState());
    const op:string = (StoreUtils.getStoreState() == constants.EDIT_BUY || StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 ? "Buy" : "Sell");

    return (<div id="dvData2">
        <form onSubmit={handleSubmit}>
            <table>
                <tbody>
                <tr>
                    <td style={{color: "red", maxWidth: "20em"}} colSpan={2}>
                        {error && <strong>{error}</strong>}
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <h6 style={{textAlign:"center"}}> {op} {currencycode}</h6>
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
                            disabled={StoreUtils.getStoreState() == constants.EDIT_BUY_STEP2 || StoreUtils.getStoreState() == constants.EDIT_SELL_STEP2}
                            style={{textAlign:"right"}}
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
                        <label>{commissionamount}</label>
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
                                    hidden={StoreUtils.getStoreState() != constants.EDIT_BUY_STEP2 && StoreUtils.getStoreState() != constants.EDIT_SELL_STEP2}>Back
                            </button>
                            <button type="submit" style={{margin: "5px 5px"}}>{op}</button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </form>
        </div>
    )
}

BuySellForm = reduxForm({
    form: 'buySell',
    initialValues:{amount:100}/*,
    destroyOnUnmount: false*/
})(BuySellForm);

export default BuySell;
