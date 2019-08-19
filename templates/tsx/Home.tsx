import * as React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import Transfer from "./Transfer";
import BuySell from "./BuySell";
import {editBuy, editSell, editTransfer, view} from "./Actions";
import store, {StoreUtils} from "./Store";
import * as constants from "./Constants";
import {SAVE_EDIT} from "./Constants";

    class Home extends React.Component<{},{rates: constants.IRate[]|undefined, rate: number,
                                      currencyid: number, currencycode: string, minimalCurrencyRest: number}> {

        unsubscribe:any;

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
                rates: [],
                rate: 0,
                currencyid: 0,
                currencycode: "",
                minimalCurrencyRest: 0
            };

            this.unsubscribe = store.subscribe(this.handleStateChange);

            this.fetchData();
            this.getSetting();
        }

        componentWillUnmount(): void {
            this.unsubscribe();
        }

        getSetting(){
            if (!StoreUtils.isLoggedIn())
                return;

            let that = this;
            fetch('./setting?name=' + constants.MINIMAL_CURRENCY_REST, StoreUtils.authHeader()
            ).then(function (response) {
                if (response.ok) {
                    let data = response.json();
                    data.then(data => {
                        let minimalCurrencyRest = (data as {value:string}[])[0].value as unknown as number;
                        that.setState({
                            minimalCurrencyRest:minimalCurrencyRest
                        });
                    })
                }
            })
        }

        fetchData() {

            console.log('fetch home rates: ', StoreUtils.isLoggedIn());
            if (!StoreUtils.isLoggedIn())
                return;

            let that = this;
            fetch('./homerates', StoreUtils.authHeader()
            ).then(function (response) {
                if (response.ok) {
                    console.log('homerates: ', response);
                    let data = response.json();
                    data.then(data => {
                        let rates = (data as constants.IRate[]);
                        console.log('rates: ', rates);
                        that.setState({
                            rates: rates
                        }, that.switchToView);
                    })
                }
            })
        }

        // switch to HOME_VIEW state
        switchToView(){
            console.log('switchToView');
            if (StoreUtils.getStoreState() == SAVE_EDIT )
            {
                store.dispatch(view());
            }
        }

        flagTemplate(rowData: any, column: string) {
            let src: string = "./static/images/" + rowData.code.toLowerCase() + ".png";
            return <img src={src}/>;
        }

        buySellClick(event: any) {
            let op:string = event.target.attributes["op"].value;
            let currencyCode:string = event.target.attributes["currencycode"].value;
            let currencyid:number = event.target.attributes["currencyid"].value;
            let rate:number = event.target.attributes["rate"].value;

            store.dispatch(op == "buy" ? editBuy(1) : editSell(1)); // dispatch action
            this.setState({currencycode: currencyCode, rate: rate, currencyid: currencyid},
                 () => {console.log('state: ', this.state); this.forceUpdate()});
        }

        isViewMode(){
            return (StoreUtils.getStoreState() == constants.VIEW_HOME);
        }

        buySellTemplate(rowData: any, rate:number, op:string){
            return <Button type="button" onClick={this.buySellClick} op={op} currencyid={rowData.currencyid}
                           currencycode={rowData.code} rate={rate}
                           disabled={!this.isViewMode()}>
                           {rate}
            </Button>
        }

        buyTemplate(rowData: any, column: string) {
            return this.buySellTemplate(rowData, rowData.buyrate, "buy");
        }

        sellTemplate(rowData: any, column: string) {
            return this.buySellTemplate(rowData, rowData.sellrate, "sell");
        }

        transferClick(event: any) {
            let currencyid = event.target.attributes["currencyid"].value;
            let currencycode:string = event.target.attributes["currencycode"].value;
            store.dispatch(editTransfer());
            this.setState({currencycode: currencycode, currencyid: currencyid}, () => this.forceUpdate());
        }

        transferTemplate(rowData: any, column: string) {
            return <Button type="button" onClick={this.transferClick} op="tr" currencyid={rowData.currencyid}
                           currencycode={rowData.code}
                           disabled={!this.isViewMode()}
                           className = {parseFloat(rowData.amount) <= this.state.minimalCurrencyRest ? "btnRed" : ""}>
                           {rowData.amount}
                   </Button>
        }

        handleStateChange(){
            console.log('handleStateChange: ', StoreUtils.getStoreState(), store.getState());
            if (StoreUtils.getStoreState() == constants.SAVE_EDIT)
            {
                 this.fetchData();
            } else
            if (StoreUtils.getStoreState() == constants.VIEW_HOME) {
                console.log('VIEW_HOME -> force update');
                this.getSetting();
                this.forceUpdate();
            }
        }

        render() {
            let url = window.location.href;

            // don't render if not on Home page
            if (url.indexOf('login') > 0 || url.indexOf('trans') > 0 || url.indexOf('admin') > 0)
            {
                return '';
            }

            console.log('About to render Home')
            console.log('store.main: ', store.getState().main);
            console.log('store.security: ', store.getState().security);

            if (StoreUtils.isLoggedIn() && (this.state.rates == undefined || this.state.rates.length == 0))
            {
                this.fetchData();
                return '<div id="dvHome">Loading ...</div>';
            } else

            if (this.state.rates && this.state.rates.length > 0) {
                console.log('rates: ', this.state.rates);
                console.log('store state: ', StoreUtils.getStoreState());
                let editForm = (StoreUtils.getStoreState() == constants.EDIT_BUY || StoreUtils.getStoreState() == constants.EDIT_SELL ?
                    <BuySell rate={this.state.rate} amount={100} currencycode={this.state.currencycode} currencyid={this.state.currencyid} />
                    : (StoreUtils.getStoreState() == constants.EDIT_TRANSFER ? <Transfer amount={100} currencyid={this.state.currencyid}/> : ""));

                return (<div id="dvHome">
                        <DataTable value={this.state.rates}>
                            <Column field="name" header="Currency" style={{width: '13em'}}/>
                            <Column field="buyrate" header="Buy" body={this.buyTemplate}/>
                            <Column field="sellrate" header="Sell" body={this.sellTemplate}/>
                            <Column field="code" body={this.flagTemplate}/>
                            <Column field="amount" header="Amount" body={this.transferTemplate}/>
                        </DataTable>
                        <br/>
                        {editForm}
                    </div>
                )
            } else {
                return ("");
            }
        }
    }

export default Home;