import * as React from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import "primereact/resources/themes/nova-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import store, {StoreUtils} from "./Store";
import {view} from "./Actions";

interface ICurrency {
    currencyid: number;
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

const transactionTypeFilterData: ITransactionTypeFilter[] = [{value: 0, name: "All"},
    {value: 1, name: "Buy/Sell"}, {value: 2, name: "Buy"},
    {value: 3, name: "Sell"}, {value: 4, name: "Send/Receive"}, {value: 5, name: "Send"},
    {value: 6, name: "Receive"}, {value: 7, name: "Debit"}, {value: 8, name: "Credit"}];

export class Transactions extends React.Component<{}, {data: ITransactions[]|undefined, currency: ICurrency|undefined,
                                             dateFrom: Date|undefined, dateTo: Date|undefined,
                                             transactionTypeMode: ITransactionTypeFilter|undefined}> {

    public loaded: boolean = false;
    private currencies: ICurrency[] = [];
    // Calc Transactions grid body height depending on page height
    private gridHeight: string = (window.innerHeight - 225) as unknown as string + "px";

    constructor(props: any) {
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.fetchCurrency = this.fetchCurrency.bind(this);
        this.onDataFilterChange = this.onDataFilterChange.bind(this);
        this.state = {
            currency: undefined,
            data: [],
            dateFrom: undefined,
            dateTo: undefined,
            transactionTypeMode: transactionTypeFilterData[0]
        };
        store.dispatch(view()); // in case edit form is active
    }

    public render() {
        if (!this.loaded) {
            return <div id="dvSettings">Loading...</div>;
        }

        const dataFilters = <div id="dvFilters">
            Currency <Dropdown value={this.state.currency} options={this.currencies} onChange={this.onDataFilterChange}
                               placeholder="Select Currency" optionLabel="code"/>
            <span style={{padding: "0 0.5em"}}>Date from </span>
            <Calendar value={this.state.dateFrom}
                      onChange={(e) => this.setState({dateFrom: (e.value as Date)}, () => this.fetchData())}
                      showIcon={true} showTime={true}/>
            <span style={{padding: "0em 0.5em 0em 2.5em"}}>to</span>
            <Calendar value={this.state.dateTo}
                      onChange={(e) => this.setState({dateTo: (e.value as Date)}, () => this.fetchData())}
                      showIcon={true} showTime={true}/>
            <span style={{padding: "0em 0.5em 0em 2.5em"}}>Transaction Types </span>
            <Dropdown value={this.state.transactionTypeMode} options={transactionTypeFilterData}
                      onChange={(e) => this.setState({transactionTypeMode: e.value as ITransactionTypeFilter},
                          () => this.fetchData())}
                      optionLabel="name"/>
        </div>;

        let sumAmount: number = 0;
        let sumCommission: number = 0;
        if (this.state.data && this.state.data.length > 0) {
            for (const d of this.state.data) {
                sumAmount = sumAmount + parseFloat(d.amount);
                if (d.commission !== "n/a") {
                    sumCommission = sumCommission + parseFloat(d.commission);
                }
            }
        }

        const anyCurrency: number = 0;
        const dataTable = this.state.data && this.state.data.length > 0 ?
            <div id="dvTransactions">
                <DataTable value={this.state.data} sortMode="multiple" scrollable={true} scrollHeight={this.gridHeight}>
                    <Column field="date" header="Date/Time" sortable={true} style={{width: "12em"}}/>
                    <Column field="code" header="Currency" sortable={true} style={{textAlign: "center", width: "8em"}}/>
                    <Column field="amount" header="Amount" sortable={true} style={{textAlign: "right", width: "7em"}}
                            footer={this.state.currency && this.state.currency.currencyid !== anyCurrency ?
                                sumAmount.toFixed(2) : ""}
                            footerStyle={{textAlign: "right"}}/>
                    <Column field="transactiontype" header="Type" sortable={true}
                            style={{textAlign: "right", width: "5em"}}/>
                    <Column field="commission" header="Commission" sortable={true}
                            style={{textAlign: "right", width: "10em"}}
                            footer={this.state.currency && this.state.currency.currencyid !== anyCurrency ?
                                sumCommission.toFixed(2) : ""}
                            footerStyle={{textAlign: "right"}}/>
                    <Column field="rate" header="Exchange&nbsp;Rate" sortable={true}
                            style={{textAlign: "right", width: "11em"}}/>
                    <Column field="note" header="Note" sortable={true} style={{width: "15em"}}/>
                    <Column field="username" header="User" sortable={true} style={{width: "10em"}}/>
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
        );
    }

    public componentDidMount() {
        this.fetchCurrency();
        this.fetchData();
    }

    public fetchCurrency() {
        const that = this;
        fetch("./currencies", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((d) => {
                    that.currencies = (d as ICurrency[]);
                    that.setState({currency: that.currencies[0]});
                });
            }
        });
    }

    private fetchData() {
        const that = this;
        fetch("./transactions?currencyid=" + (this.state.currency &&
            this.state.currency.currencyid ? this.state.currency.currencyid : "0" /*All*/)
            + "&&dateFrom=" + this.state.dateFrom
            + "&&dateTo=" + this.state.dateTo
            + "&&transactionTypeMode=" + (this.state.transactionTypeMode ? this.state.transactionTypeMode.value : ""),
            StoreUtils.authHeader()
        ).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((d) => {
                    const trans = (d as ITransactions[]);
                    that.setState({
                        data: trans
                    });
                    that.loaded = true;
                    that.forceUpdate();
                });
            }
        });
    }

    private onDataFilterChange(e: any) {
        const cur = (e.value as ICurrency);
        this.setState({currency: cur}, () => this.fetchData());
    }
}

export default Transactions;
