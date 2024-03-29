import * as React from "react";
import * as constants from "./Constants";
import {updateRate} from "./Actions";
import store, {StoreUtils} from "./Store";
import {IRate} from "./Constants";

interface ISetting {
    name: string;
    value: string;
}

interface IRateData {
  privacy: string|undefined;
  quotes: any|undefined;
  source: string|undefined;
  success: boolean|undefined;
  terms: string|undefined;
  timestamp: number|undefined;
}

interface IReceivedRates {
    USDCAD: number;
    USDCNY: number;
    USDEUR: number;
    USDGBP: number;
    USDILS: number;
    USDTRY: number;
}
// "http://apilayer.net/api/live?
// access_key=1436c7f38f4d4cf84bef185d98378183&source=USD&currencies=EUR,GBP,ILS,TRY,CAD,CNY";
const ratesURLTemplate =
              "http://apilayer.net/api/live?access_key=1436c7f38f4d4cf84bef185d98378183&source=USD&currencies=";

const sampleRatesData: IRateData = {success: true,

    privacy: "https://currencylayer.com/privacy",
    quotes: {USDCAD: 1.333335, USDCNY: 7.060201, USDEUR: 0.89007, USDGBP: 0.82245, USDILS: 3.479698, USDTRY: 5.489398},
    source: "USD",
    terms: "https://currencylayer.com/terms",
    timestamp: 1565194085
};

// Service that receives rates periodically according to the "refreshPeriod" setting
class RateService extends React.Component<{isGetRealData: boolean}, {rates: IRate[], refreshPeriod: number,
              buySellRateMargin: number, isGetRealData: boolean}> {

    private ratesURL: string = ratesURLTemplate;
    private unsubscribe: any;
    private timerId: any;

    constructor(props: any) {
        super(props);
        this.state = {
            buySellRateMargin: 0,
            isGetRealData: props.isGetRealData,
            rates: [],
            refreshPeriod: 0
        };

        this.getDBRates = this.getDBRates.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.doWork = this.doWork.bind(this);
        this.getRates = this.getRates.bind(this);
        this.updateRates = this.updateRates.bind(this);
        this.saveRates = this.saveRates.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);

        this.getDBRates();
        this.getSettings();

        this.unsubscribe = store.subscribe(this.handleStateChange);
    }

    public render() {
        return "";
    }

    public componentWillUnmount(): void {
        this.unsubscribe();
    }

    private getDBRates() {
        const that = this;
        fetch("./rates", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((d) => {

                    const rates = d as IRate[];
                    that.setState({rates});

                    let currencyCodes: string = "";
                    for (const r of rates) {
                        if (r.code !== "USD") {
                            currencyCodes = currencyCodes + r.code + ",";
                        }
                    }
                    currencyCodes = currencyCodes.slice(0, currencyCodes.length - 1);
                    that.ratesURL = that.ratesURL + currencyCodes; // full url with currency codes to get rates for
                });
            }
        });
    }

    private getSettings() {
        const that = this;
        fetch("./settings", StoreUtils.authHeader()).then((response) => {
            if (response.ok) {
                const data = response.json();
                data.then((d) => {
                    const settings = (d as ISetting[]);
                    for (const s of settings) {
                        if (s.name === constants.BUY_SELL_RATE_MARGIN) {
                            that.setState({
                                buySellRateMargin: s.value as unknown as number
                            });
                        } else if (s.name === constants.REFRESH_PERIOD) {
                            that.setState({
                                    refreshPeriod: s.value as unknown as number
                                },
                                that.doWork
                            );
                        }
                    }
                });
            }
        });
    }

    private doWork() {
        const that = this;
        if (this.state.refreshPeriod > 0) {
            this.timerId = setInterval(() => {
                    that.getRates();
                },
                this.state.refreshPeriod * 1000);
        }
    }

    private updateRates(rates: IReceivedRates) {
        const newRates = this.state.rates;

        const d = new Date();
        const ds = d.getFullYear() + "/" +
            (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "/" +
            (d.getDate() < 10 ? "0" : "") + d.getDate() + " " +
            (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" +
            (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" +
            (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();

        // match the stored rates with the received ones
        for (const nr of newRates) {
            const code = nr.code;
            let rate: number = 0;

            switch (code) {
                case "EUR":
                    rate = rates.USDEUR;
                    break;
                case "GBP":
                    rate = rates.USDGBP;
                    break;
                case "ILS":
                    rate = rates.USDILS;
                    break;
                case "CAD":
                    rate = rates.USDCAD;
                    break;
                case "TRY":
                    rate = rates.USDTRY;
                    break;
                case "CNY":
                    rate = rates.USDCNY;
                    break;
            }

            rate = 1 / rate; // reverse rate: 0.88 EUR -> 1.1363 USD
            rate = rate + (0.5 - Math.random()) * 0.01; // add random part to differ rate from previous one
            rate = Math.round(rate * 10000) / 10000; // round to 4 digits precision

            // buy rate = rate - buySellRateMargin/2 %; sell rate = rate + buySellRateMargin/2 %
            nr.buyrate = Math.round(rate * (1 - this.state.buySellRateMargin / 200) * 10000) / 10000;
            nr.sellrate = Math.round(rate * (1 + this.state.buySellRateMargin / 200) * 10000) / 10000;
            nr.date = ds;
        }

        this.saveRates(newRates);
    }

    private saveRates(rates: IRate[]) {
        const that = this;
        fetch("/saverates", {
            body: JSON.stringify(rates),
            headers: StoreUtils.authHeader(false),
            method: "post"
        }).then(() => {
            that.setState({rates});
            store.dispatch(updateRate(rates));
        }).catch((error) => {
            console.log(error);
        });
    }

    private getRates() {
        const that = this;
        if (this.state.isGetRealData) {
            fetch(this.ratesURL).then((response) => {
                if (response.ok) {
                    const data = response.json();
                    data.then((d) => {
                        const rates = (d as IRateData).quotes;
                        that.updateRates(rates);
                    });
                }
            });
        } else {
            const rates = sampleRatesData.quotes;
            this.updateRates(rates);
        }
    }

    private handleStateChange() {
        if (StoreUtils.getStoreState() === constants.SETTINGS_UPDATED) {
            const settings = store.getState().main.data.data as constants.ISettings;
            if (settings !== undefined) {
                const buySellRateMargin: number = settings.buySellRateMargin as unknown as number;
                const refreshPeriod: number = settings.refreshPeriod as unknown as number;
                if (buySellRateMargin !== this.state.buySellRateMargin) {
                    // apply new "buy/sell rate margin" when changed
                    this.setState({buySellRateMargin});
                }
                if (refreshPeriod !== this.state.refreshPeriod) {
                    // restart service with new "refresh period" setting
                    if (this.timerId !== undefined) {
                        clearInterval(this.timerId);
                    }
                    this.setState({refreshPeriod}, this.doWork);
                }
            }
        }
    }
}

export default RateService;
