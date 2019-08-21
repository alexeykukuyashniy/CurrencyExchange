import * as React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Dropdown} from 'primereact/dropdown';
import {Calendar} from 'primereact/calendar';
import store, {StoreUtils} from "./Store";
import {cancelEdit} from "./Actions";

interface ICurrency {
    currencyid: string;
    code: string;
}

interface ITransactionTypeFilter {
    name: string;
    value: number;
}

interface ITransactions {
    date: string;
    code: string;
    amount: string;
    transactiontype: string;
    commission: string;
    rate: string;
    note: string;
    username: string;
}

const transactionTypeFilterData: ITransactionTypeFilter[] = [{value: 0, name:'All'}, {value: 1, name: 'Buy/Sell'}, {value: 2, name: 'Buy'},
    {value: 3, name: 'Sell'}, {value: 4, name: 'Send/Receive'}, {value: 5, name: 'Send'},
    {value: 6, name: 'Receive'}, {value: 7, name: 'Debit'}, {value: 8, name: 'Credit'}];

   class Transactions extends React.Component<{},{data: ITransactions[]|undefined, currency:ICurrency|undefined,
                                             dateFrom:Date|undefined, dateTo:Date|undefined,transactionTypeMode:ITransactionTypeFilter|undefined}> {

       loaded: boolean = false;
       currencies: ICurrency[] = [];

       constructor(props: any) {
           super(props);

           this.fetchData = this.fetchData.bind(this);
           this.fetchCurrency = this.fetchCurrency.bind(this);
           this.onDataFilterChange = this.onDataFilterChange.bind(this);
           this.state = {
               data: [],
               currency: undefined,
               dateFrom: undefined,
               dateTo: undefined,
               transactionTypeMode : transactionTypeFilterData[0]
           };
           store.dispatch(cancelEdit()); // in case edit form is active
           this.fetchCurrency();
       }

       fetchCurrency() {
           let that = this;
           fetch('./currencies', StoreUtils.authHeader()).then(function (response) {
               if (response.ok) {
                   let data = response.json();
                   data.then(data => {
                       that.currencies = (data as ICurrency[]);
                       that.setState({currency: that.currencies[0]});
                       console.log(that.currencies.toString());
                       console.log('currencies fetched');
                   })
               }
           })
       }

       fetchData() {
           let that = this;
           console.log('about to fetch transactions');
           console.log('currency: ' + this.state.currency);
           console.log("currencyid: " + (this.state.currency && this.state.currency.currencyid ? this.state.currency.currencyid : ""));
           fetch('./transactions?currencyid=' + (this.state.currency && this.state.currency.currencyid ? this.state.currency.currencyid : "0" /*All*/)
                 + '&&dateFrom=' + this.state.dateFrom
               + '&&dateTo=' + this.state.dateTo
               + '&&transactionTypeMode=' + (this.state.transactionTypeMode ? this.state.transactionTypeMode.value : ""),
               StoreUtils.authHeader()
                ).then(function (response) {
               if (response.ok) {
                   let data = response.json();
                   data.then(data => {
                       let trans = (data as ITransactions[]);

                       console.log(trans);

                       that.setState({
                           data: trans
                       });
                       that.loaded = true;
                       console.log('transactions fecthed');
                       that.forceUpdate();
                   })
               }
           })
       }

       componentDidMount() {
           this.fetchData();
       }

       onDataFilterChange(e: any) {
           var cur = (e.value as ICurrency);
           console.log('e.value:' + cur)
           console.log('e.value->currencyid:' + cur.currencyid)
           this.setState({currency: cur}, () => this.fetchData());
       }

       render() {
           if (!this.loaded) {
               return <div id="dvSettings">Loading...</div>
           }

           // if (this.state.data && this.state.data.length > 0) {
           console.log('rendering');
           let dataFilters = <div id="dvFilters">
               Currency <Dropdown value={this.state.currency} options={this.currencies} onChange={this.onDataFilterChange}
                         placeholder="Select Currency" optionLabel="code"/>
                        <span style={{padding:"0 0.5em"}}>Date from </span>
                   <Calendar value={this.state.dateFrom} onChange={(e) => this.setState({dateFrom: (e.value as Date)}, () => this.fetchData())}
                             showIcon={true} showTime={true} />
               <span style={{padding:"0em 0.5em 0em 2.5em"}}>to</span>
               <Calendar value={this.state.dateTo} onChange={(e) => this.setState({dateTo: (e.value as Date)}, () => this.fetchData())}
                         showIcon={true} showTime={true} />
               <span style={{padding:"0em 0.5em 0em 2.5em"}}>Transaction Types </span>
               <Dropdown value={this.state.transactionTypeMode} options={transactionTypeFilterData}
                         onChange={(e) => this.setState({transactionTypeMode: e.value as ITransactionTypeFilter}, () => this.fetchData())}
                          optionLabel="name"/>
           </div>;

           let sumAmount:number = 0;
           let sumCommission:number = 0;
           if (this.state.data && this.state.data.length > 0) {
               for (let i = 0; i < this.state.data.length; i++) {
                   sumAmount = sumAmount+ parseFloat(this.state.data[i].amount);// (this.state.data[i].amount as unknown as number);
                   sumCommission = sumCommission + parseFloat(this.state.data[i].commission);// as unknown as number);
                   console.log(sumAmount);
               }
           }

           let dataTable = this.state.data && this.state.data.length > 0 ?
               <div id="dvTransactions">
               <DataTable value={this.state.data} sortMode="multiple" scrollable={true} scrollHeight="200px">
                   <Column field="date" header="Date/Time" sortable={true} style={{width:"12em"}}/>
                   <Column field="code" header="Currency" sortable={true} style={{textAlign:"center",width:"8em"}}/>
                   <Column field="amount" header="Amount" sortable={true} style={{textAlign:"right",width:"7em"}}
                           footer={this.state.currency && this.state.currency.currencyid != "0" ? sumAmount.toFixed(2) : ""}
                           footerStyle={{textAlign:"right"}}/>
                   <Column field="transactiontype" header="Type" sortable={true} style={{textAlign:"right",width:"5em"}}/>
                   <Column field="commission" header="Commission" sortable={true} style={{textAlign:"right",width:"10em"}}
                           footer={this.state.currency && this.state.currency.currencyid != "0" ? sumCommission.toFixed(2) : ""}
                           footerStyle={{textAlign:"right"}}/>
                   <Column field="rate" header="Exchange&nbsp;Rate" sortable={true} style={{textAlign:"right",width:"11em"}}/>
                   <Column field="note" header="Note" sortable={true} style={{width:"15em"}}/>
                   <Column field="username" header="User" sortable={true} style={{width:"10em"}}/>
               </DataTable>
                   </div>
               :
               <div style={{width: "100%", textAlign: "center"}}>No Data</div>;

           return (
               <>
                   {dataFilters}
                   <br/>
                   {dataTable}
               </>
           )
       }
   }

export default Transactions;