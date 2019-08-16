import * as React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form'
import store, {StoreUtils} from './Store';
import {cancelEdit, saveEdit} from "./Actions";
import axios from 'axios';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface TransferProps {
    amount: number;
    currencyid: number;
}

interface TransferState {
    amount: number;
    currencyid: number;
    person: string;
    currency:ICurrency|undefined;
    currencies:ICurrency[]|undefined;
}

interface ICurrency {
    currencyid: number;
    code: string;
    amountrest:number;
}

interface IFormData{
    amount:number;
    currencyid:number;
    person:string;
    btnClicked:string;
}

const enum TR_TRANSACTION_TYPES {BUY = 1, SELL = 2, SEND = 3, RECEIVE = 4};

   class Transfer extends React.Component<TransferProps, TransferState> {

       formData:IFormData = {amount:0,currencyid:0,person:"",btnClicked:""};

       constructor(props: TransferProps) {
           super(props);

           this.submit = this.submit.bind(this);
           this.fetchCurrency = this.fetchCurrency.bind(this);
           this.cancelClick = this.cancelClick.bind(this);
           this.validateForm = this.validateForm.bind(this);
           this.saveFormData = this.saveFormData.bind(this);

           this.state = {
               amount: props.amount,
               currencyid: props.currencyid,
               person:"",
               currency:undefined,
               currencies:undefined
           };
           console.log('initial state:', this.state);
           this.fetchCurrency();
       }

       fetchCurrency() {
           let that = this;
           fetch('./currencies', StoreUtils.authHeader()).then(function (response) {
               if (response.ok) {
                   let data = response.json();
                   data.then(data => {
                       let currencies:ICurrency[] = (data as ICurrency[]);
                       currencies = currencies.slice(1); // remove "ALL"
                       that.setState({currencies: currencies});
                       console.log(currencies[0].toString());
                       console.log('currencies fetched');
                   })
               }
           })
       }

       saveFormData()
       {
           console.log('saving...');
           console.log('formData:', this.formData, this.state);
           let currencyid:number = this.formData.currencyid;

           let transactionType:number = (this.formData.btnClicked == "send" ? TR_TRANSACTION_TYPES.SEND : TR_TRANSACTION_TYPES.RECEIVE);

           let data = {
               "TransactionType": transactionType,
               "CurrencyID": currencyid,
               "Amount": this.formData.amount,
               "Note": this.formData.person,
               "Rate": 0, // N/A
               "Commission": 0 // N/A
           };
           console.log(data);

           axios.post('/transaction', data, StoreUtils.authHeader())
               .then(function (response) {
                   console.log(response);
                   store.dispatch(saveEdit()); // return to grid
               })
               .catch(function (error) {
                   console.log(error);
               });
       }

       validateForm() {
           let errors = "";
           console.log('validating: ', this.formData.amount, this.formData.person, this.formData.currencyid, this.state.currencies);
           if (this.formData.amount < 10) {
               errors = errors + "Amount should not be less than 10. \n";
           }
           if (this.formData.person.trim().length == 0) {
               errors = errors + "Person is required. \n";
           }
           if (this.formData.btnClicked == "send" && this.state.currencies) {
               let currencies = this.state.currencies;
               let currencyid:number = this.formData.currencyid as number;

               let amountRest:number = 0;
               for(let i=0; i<currencies.length; i++) {
                   if (currencies[i].currencyid == currencyid) {
                       amountRest = currencies[i].amountrest;
                       break;
                   }
               }
               console.log('amountRest: ', amountRest);
               if (this.formData.amount > amountRest) {
                   errors = errors + "Amount should not be greater than " + amountRest +".";
               }
           }

           if (errors.length > 0) {
               throw new SubmissionError({_error: errors});
           } else {
               this.saveFormData();
           }
       }

       submit(values: any) {
           console.log('submit');
           console.log(values);

           this.formData = (values as IFormData);
           this.validateForm();
       }

       cancelClick(event:any) {
           console.log('cancel clicked');
           store.dispatch(cancelEdit());
       }

       render() {
           if (this.state.currencies == undefined)
           {
               return 'Loading...'
           }
           console.log('rendering Transfer')
           console.log(this.props);
           console.log(this.state);

           TransferForm = reduxForm({
               form: 'Transfer',
               initialValues:{amount: 100, currencyid: this.state.currencyid, person: ""}
           })(TransferForm);

           return (<TransferForm onSubmit={this.submit}
                                cancelClick={this.cancelClick}
                                currencyid={this.state.currencyid}
                                currencies={this.state.currencies}
                                amount={this.state.amount}
                   />
           )
       }
   }

let TransferForm = (props:any) => {
    const {error, handleSubmit, cancelClick, currencyid, currencies, amount} = props;
    console.log(props);
    console.log(props.currencyid);
    console.log(amount);
    console.log(props.amount);
    console.log("store state: ", StoreUtils.getStoreState());

    return (<div id="dvData">
            <form onSubmit={handleSubmit}>
                <h6 style={{textAlign: "center"}}>Send/Receive Cash</h6>
                <table>
                    <tbody>
                    <tr>
                        <td style={{color: "red",maxWidth: "20em"}} colSpan={2}>
                            {error && <strong>{error}</strong>}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="currencyid">Currency:</label>
                        </td>
                        <td align="right">
                            <Field
                                name="currencyid"
                                component="select"
                                 style={{width: "100%"}}
                                value={currencyid}
                            >
                                {currencies.map((c: ICurrency) => (
                                        <option key={c.currencyid} value={c.currencyid}>
                                            {c.code}
                                        </option>
                                    )
                                )}
                            </Field>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="amount">Amount:</label>
                        </td>
                        <td align="right">
                            <Field
                                name="amount"
                                component="input"
                                type="number"
                                value={amount}
                                style={{textAlign: "right"}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="person">To/from whom:</label>
                        </td>
                        <td align="right">
                            <Field
                                name="person"
                                component="input"
                                type="text"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{float: "right"}}>
                                <button type="button" onClick={props.cancelClick} style={{margin: "5px 5px"}}>
                                    Cancel
                                </button>
                                <button type="submit" style={{margin: "5px 5px"}}
                                        onClick={handleSubmit((values: any) =>
                                            props.onSubmit({
                                                ...values,
                                                btnClicked: 'send'
                                            }))}
                                >
                                    Send
                                </button>
                                <button type="submit" style={{margin: "5px 5px"}}
                                        onClick={handleSubmit((values: any) =>
                                            props.onSubmit({
                                                ...values,
                                                btnClicked: 'receive'
                                            }))}
                                >
                                    Receive
                                </button>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </form>
        </div>
    )
}



export default Transfer;
