import * as React from "react";
import axios from "axios";
import * as constants from "./Constants";
import store, {StoreUtils} from "./Store";
import {view, updateSettings} from "./Actions";

interface ISetting {
  name: string;
  value: string;
}

export class Admin extends React.Component<{}, constants.ISettings> {

    public loaded: boolean = false;
    private status: string = "";

    constructor(props: any) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.clearStatus = this.clearStatus.bind(this);

        this.state = {
            buySellRateMargin: "",
            commission: "",
            minimalCommission: "",
            refreshPeriod: "",
            surcharge: ""
        };
        store.dispatch(view()); // in case edit form is active
    }

    public render() {
        console.log("rendering...");
        if (!this.loaded) {
            return <div id="dvSettings">Loading...</div>;
        }
        return (
            <div id="dvSettings">
                <form method="POST">
                    <h5>
                        Change setting below and click Update
                    </h5>
                    <div className="horizontal-rule"/>
                    <table className="tblSetting">
                        <tbody>
                        <tr>
                            <td>
                                Refresh currency exchange rates every&nbsp;
                            </td>
                            <td>
                                <input
                                    name={constants.REFRESH_PERIOD}
                                    type="text"
                                    value={this.state.refreshPeriod}
                                    onChange={this.handleInputChange}
                                />
                                &nbsp;seconds (0-60)
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Commission, % (0-3):
                            </td>
                            <td>
                                <input
                                    name={constants.COMMISSION}
                                    type="text"
                                    value={this.state.commission}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Surcharge, USD (0-3):
                            </td>
                            <td>
                                <input
                                    name={constants.SURCHARGE}
                                    type="text"
                                    value={this.state.surcharge}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Minimal Commission, USD (0-3):
                            </td>
                            <td>
                                <input
                                    name={constants.MINIMAL_COMMISSION}
                                    type="text"
                                    value={this.state.minimalCommission}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Buy/Sell rate margin, % (0-2):
                            </td>
                            <td>
                                <input
                                    name={constants.BUY_SELL_RATE_MARGIN}
                                    type="text"
                                    value={this.state.buySellRateMargin}
                                    onChange={this.handleInputChange}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="horizontal-rule"/>
                    <input type="button" onClick={this.saveSettings} value="Update" disabled={!this.isDataValid()}/>
                    <span id="spStatus" style={{marginLeft: "1em", fontStyle: "italic"}}>{this.status}</span>
                </form>
            </div>
        );
    }

    public fetchData() {
        try {
            const that = this;
            fetch("./settings", StoreUtils.authHeader()).then((response) => {
                if (response.ok) {
                    let commission: string = "";
                    let refreshPeriod: string = "";
                    let surcharge: string = "";
                    let minimalCommission: string = "";
                    let buySellRateMargin: string = "";
                    const data = response.json();
                    data.then((d) => {
                        const settings = (d as ISetting[]);
                        for (const s of settings) {
                            switch (s.name) {
                                case constants.REFRESH_PERIOD:
                                    refreshPeriod = s.value;
                                    break;
                                case constants.COMMISSION:
                                    commission = s.value;
                                    break;
                                case constants.SURCHARGE:
                                    surcharge = s.value;
                                    break;
                                case constants.MINIMAL_COMMISSION:
                                    minimalCommission = s.value;
                                    break;
                                case constants.BUY_SELL_RATE_MARGIN:
                                    buySellRateMargin = s.value;
                                    break;
                            }
                        }

                        that.setState({
                            buySellRateMargin,
                            commission,
                            minimalCommission,
                            refreshPeriod,
                            surcharge
                        });
                        that.loaded = true;
                        that.forceUpdate();
                    });
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    public componentDidMount() {
        this.fetchData();
    }

    private handleInputChange(event: any) {
        console.log(event.target.value);
        console.log(event.target.attributes.getNamedItem("name").value);
        console.log(event.target);
        const name: string = event.target.attributes.getNamedItem("name").value;
        const updState: constants.ISettings = this.state;
        let val: string = event.target.value;

        if (val.length > 0) {
            console.log(val.indexOf("."));
            if (name === constants.REFRESH_PERIOD /*&& parseInt(val) == NaN*/) {
                val = parseInt(val, 10).toString();
            } else if (val.indexOf(".") > 0 && val[val.length - 1] !== "." && val.indexOf(".") <  val.length - 3) {
                val = parseFloat(val).toString();
                // leave 2 digits after dot
                const val2: string = Number(Math.floor(parseFloat(val) * 100 ) / 100).toFixed(2) ;
                if (val !== val2) {
                    val = val2;
                }
            }
        }

        if (val === "NaN") {
            return;
        }
        console.log("set value", val);
        switch (name) {
            case constants.COMMISSION :
                updState.commission = val;
                break;
            case constants.REFRESH_PERIOD :
                updState.refreshPeriod = val;
                break;
            case constants.SURCHARGE :
                updState.surcharge = val;
                break;
            case constants.MINIMAL_COMMISSION :
                updState.minimalCommission = val;
                break;
            case constants.BUY_SELL_RATE_MARGIN :
                updState.buySellRateMargin = val;
                break;
        }
        this.setState(updState, this.clearStatus);
    }

    private clearStatus() {
        this.status = "";
    }

    private isDataValid() {
        return this.state.refreshPeriod.length > 0 &&
            this.state.commission.length > 0 &&
            this.state.surcharge.length > 0 &&
            this.state.minimalCommission.length > 0 &&
            this.state.buySellRateMargin.length > 0 &&
            parseInt(this.state.refreshPeriod, 10) >= 0 &&
            parseInt(this.state.refreshPeriod, 10) <= 60 &&
            parseFloat(this.state.commission) >= 0 &&
            parseFloat(this.state.commission) <= 3 &&
            parseFloat(this.state.surcharge) >= 0 &&
            parseFloat(this.state.surcharge) <= 3 &&
            parseFloat(this.state.minimalCommission) >= 0 &&
            parseFloat(this.state.minimalCommission) <= 3 &&
            parseFloat(this.state.buySellRateMargin) >= 0 &&
            parseFloat(this.state.buySellRateMargin) <= 2;
    }

    private saveSettings(event: any) {
        const that = this;
        const data: constants.ISettings = {
                buySellRateMargin: this.state.buySellRateMargin,
                commission: this.state.commission,
                minimalCommission: this.state.minimalCommission,
                refreshPeriod: this.state.refreshPeriod,
                surcharge: this.state.surcharge
            };

        const dataSave = {
            BuySellRateMargin: this.state.buySellRateMargin,
            Commission: this.state.commission,
            MinimalCommission: this.state.minimalCommission,
            RefreshPeriod: this.state.refreshPeriod,
            Surcharge: this.state.surcharge
        };
        axios.post("/savesettings", dataSave, StoreUtils.authHeader()).then((response) => {
                that.status = "Saved";
                store.dispatch(updateSettings(data));
                that.forceUpdate();
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

export default Admin;
