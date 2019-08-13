import * as React from 'react';
import axios from 'axios';
import * as constants from './Constants';
import {updateRate} from "./Actions";
import store from "./Store";
import {IRate} from "./Constants";

interface setting {
    name: string;
    value: string;
}

interface IRateData{
  privacy:string|undefined;
  quotes:any|undefined;
  source:string|undefined;
  success:boolean|undefined;
  terms:string|undefined;
  timestamp:number|undefined;
}

interface IReceivedRates{
    USDCAD:number;
    USDCNY:number;
    USDEUR:number;
    USDGBP:number;
    USDILS:number;
    USDTRY:number;
}
//"http://apilayer.net/api/live?access_key=1436c7f38f4d4cf84bef185d98378183&source=USD&currencies=EUR,GBP,ILS,TRY,CAD,CNY";
const ratesURLTemplate="http://apilayer.net/api/live?access_key=1436c7f38f4d4cf84bef185d98378183&source=USD&currencies=";

const sampleRatesData:IRateData ={success: true,
    terms: "https://currencylayer.com/terms",
    privacy: "https://currencylayer.com/privacy",
    timestamp: 1565194085,
    source: "USD",
    quotes:{USDCAD:1.333335,USDCNY:7.060201,USDEUR:0.89007,USDGBP:0.82245,USDILS:3.479698,USDTRY:5.489398}
}

// Service that receives rates updates periodically according to the "refreshPeriod" setting
class RateService extends React.Component<{isGetRealData:boolean}, {rates:IRate[], refreshPeriod:number,
              buySellRateMargin: number, isGetRealData:boolean}> {

    ratesURL: string = ratesURLTemplate;

    constructor(props: any) {
        super(props);
        this.state = {
            rates: [],
            refreshPeriod: 0,
            buySellRateMargin: 0,
            isGetRealData: props.isGetRealData
        }

        this.getDBRates = this.getDBRates.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.doWork = this.doWork.bind(this);
        this.getRates = this.getRates.bind(this);
        this.updateRates = this.updateRates.bind(this);
        this.saveRates = this.saveRates.bind(this);

        this.getDBRates();
        this.getSettings();
    }

    getDBRates() {
        let that = this;
        fetch('./rates').then(function (response) {
            if (response.ok) {
                let data = response.json();
                data.then(data => {

                    let rates = data as IRate[];
                    console.log('DB rates: ', rates);
                    that.setState({rates: rates});

                    let currencyCodes: string = "";
                    for (let i: number = 0; i < rates.length; i++) {
                        if (rates[i].code != "USD") {
                            currencyCodes = currencyCodes + rates[i].code + ",";
                        }
                    }
                    console.log('currencyCodes: ', currencyCodes);
                    currencyCodes = currencyCodes.slice(0, currencyCodes.length - 1);
                    that.ratesURL = that.ratesURL + currencyCodes; // full url with currency codes to get rates for
                    console.log('rates url:', that.ratesURL);
                    console.log('currencies fetched');
                });
            }
        })
    }

    getSettings() {
        let that = this;
        fetch('./settings').then(function (response) {
            if (response.ok) {
                let data = response.json();
                data.then(data => {
                    let settings = (data as setting[]);
                    for (let i = 0; i < settings.length; i++) {
                        console.log(settings[i]);
                        if (settings[i].name == constants.BUY_SELL_RATE_MARGIN) {
                            that.setState({
                                buySellRateMargin: settings[i].value as unknown as number
                            });
                        } else if (settings[i].name == constants.REFRESH_PERIOD) {
                            that.setState({
                                    refreshPeriod: settings[i].value as unknown as number
                                },
                                that.doWork
                            )
                        }
                    }
                })
            }
        })
    }

    doWork() {
        let that = this;
        if (this.state.refreshPeriod >= 10) {
            let timerId = setInterval(function () {
                    that.getRates()
                },
                this.state.refreshPeriod * 1000);
        }
        console.log('service state:', this.state);
    }

    updateRates(rates: IReceivedRates) {
        let newRates = this.state.rates;

        let d = new Date();
        let ds = d.getFullYear() + '/' +
            (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '/' +
            (d.getDate() < 10 ? '0' : '') + d.getDate() + ' ' +
            (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
            (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
            (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        console.log('new date:', d, ' str:', ds);

        // match the stored rates with the received ones
        for (let i: number = 0; i < newRates.length; i++) {
            let code = newRates[i].code;
            let rate: number = 0;

            switch (code) {
                case 'EUR':
                    rate = rates.USDEUR;
                    break
                case 'GBP':
                    rate = rates.USDGBP;
                    break
                case 'ILS':
                    rate = rates.USDILS;
                    break
                case 'CAD':
                    rate = rates.USDCAD;
                    break
                case 'TRY':
                    rate = rates.USDTRY;
                    break
                case 'CNY':
                    rate = rates.USDCNY;
                    break
            }

            rate = 1 / rate; // reverse rate: 0.88 EUR -> 1.1363 USD
            rate = rate + (0.5 - Math.random()) * 0.01; // add random part to differ rate from previous one
            rate = Math.round(rate * 10000) / 10000; // round to 4 digits precision
            console.log('currency: ', code, 'rate: ', rate);

            // buy rate = rate - buySellRateMargin/2 %; sell rate = rate + buySellRateMargin/2 %
            newRates[i].buyrate = Math.round(rate * (1 - this.state.buySellRateMargin / 200) * 10000) / 10000;
            newRates[i].sellrate = Math.round(rate * (1 + this.state.buySellRateMargin / 200) * 10000) / 10000;

            console.log(newRates[i].buyrate,' ',newRates[i].sellrate, ' ', this.state.buySellRateMargin, ' ', (1 - this.state.buySellRateMargin / 200));

            newRates[i].date = ds;
        }

        console.log('updated rates: ', newRates);
        this.saveRates(newRates);
    }

    saveRates(rates: IRate[]) {
        console.log('save rates to db');
        console.log('rates to save: ', rates);
        let that = this;
        axios.post('/saverates', rates)
            .then(function (response) {
                console.log(response);
                that.setState({rates: rates});
                store.dispatch(updateRate(rates));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getRates() {
        let that = this;
        if (this.state.isGetRealData) {
            fetch(this.ratesURL).then(function (response) {
                if (response.ok) {
                    let data = response.json();
                    console.log(data);
                    data.then(data => {
                        let rates = (data as IRateData).quotes;
                        console.log("REAL received rates: ", rates);
                        that.updateRates(rates);
                    });
                }
            });
        } else {
            let rates = sampleRatesData.quotes;

            console.log("FAKE received rates: ", rates);
            this.updateRates(rates);
        }
    }

    render() {
        return "";
    }
}

export default RateService;