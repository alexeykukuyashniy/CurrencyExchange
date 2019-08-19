import * as React from 'react';
import axios from 'axios';
import * as constants from './Constants';
import store, {StoreUtils} from "./Store";
import {cancelEdit, updateSettings} from "./Actions";

interface setting {
  name: string;
  value: string;
}

   class Admin extends React.Component<{},constants.ISettings> {

       loaded: boolean = false;
       status:string = "";
       constructor(props: any) {
           super(props);

           this.handleInputChange = this.handleInputChange.bind(this);
           this.fetchData = this.fetchData.bind(this);
           this.isDataValid = this.isDataValid.bind(this);
           this.saveSettings = this.saveSettings.bind(this);
           this.clearStatus = this.clearStatus.bind(this);

           this.state = {
               refreshPeriod: "",
               commission: "",
               surcharge: "",
               minimalCommission: "",
               buySellRateMargin: ""
           };
           store.dispatch(cancelEdit()); // in case edit form is active
       }

       handleInputChange(event: any) {
           console.log(event.target.value);
           console.log(event.target.attributes.getNamedItem("name").value);
           console.log(event.target);
           let name: string = event.target.attributes.getNamedItem("name").value;
           let updState: constants.ISettings = this.state;
           let val: string = event.target.value;

           if (val.length > 0) {
               if (name == constants.REFRESH_PERIOD /*&& parseInt(val) == NaN*/) {
                   val = parseInt(val).toString();
               } else if (val[val.length - 1] != "." && val[val.length - 1] != "0")/*if (parseFloat(val) == NaN)*/ {
                   val = parseFloat(val).toString();
               }
           }

           if (val == "NaN") {
               return;
           }
           console.log('set value', val);
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

       clearStatus(){
           this.status = "";
       }

       fetchData() {
           let that = this;
          // const requestOptions:RequestInit = { method: 'GET', headers: StoreUtils.authHeader() };
         //  let st = store.getState().security;
         //  let token: string = (st != undefined  && st.token != undefined ? st.token.toString() : "");
        //   const requestOptions:RequestInit = { method: 'GET', headers: {'Authorization': 'Bearer ' + token }}; // Authorization
         //  console.log('requestOptions: ', StoreUtils.authHeader());
           fetch('./settings', StoreUtils.authHeader()).then(function (response) {
               if (response.ok) {
                   let commission: string = "";
                   let refreshPeriod: string = "";
                   let surcharge: string = "";
                   let minimalCommission: string = "";
                   let buySellRateMargin: string = "";
                   let data = response.json();
                   data.then(data => {
                       let settings = (data as setting[]);
                       for (let i = 0; i < settings.length; i++) {
                           console.log(settings[i]);

                           switch (settings[i].name) {
                               case constants.REFRESH_PERIOD:
                                   refreshPeriod = settings[i].value;
                                   break;
                               case constants.COMMISSION:
                                   commission = settings[i].value;
                                   break;
                               case constants.SURCHARGE:
                                   surcharge = settings[i].value;
                                   break;
                               case constants.MINIMAL_COMMISSION:
                                   minimalCommission = settings[i].value;
                                   break;
                               case constants.BUY_SELL_RATE_MARGIN:
                                   buySellRateMargin = settings[i].value;
                                   break;
                           }
                       }

                       that.setState({
                           commission: commission,
                           refreshPeriod: refreshPeriod,
                           surcharge: surcharge,
                           minimalCommission: minimalCommission,
                           buySellRateMargin: buySellRateMargin
                       }/*, that.forceUpdate*/);
                       that.loaded = true;
                       console.log('fecthed');
                       that.forceUpdate();
                   })
               }
           })
       }

       componentDidMount() {
           this.fetchData();
       }

       isDataValid() {
           console.log('validating:', this.state);

           return this.state.refreshPeriod.length > 0 &&
               this.state.commission.length > 0 &&
               this.state.surcharge.length > 0 &&
               this.state.minimalCommission.length > 0 &&
               this.state.buySellRateMargin.length > 0 &&
               parseInt(this.state.refreshPeriod) >= 0 &&
               parseInt(this.state.refreshPeriod) <= 60 &&
               parseFloat(this.state.commission) >= 0 &&
               parseFloat(this.state.commission) <= 3 &&
               parseFloat(this.state.surcharge) >= 0 &&
               parseFloat(this.state.surcharge) <= 3 &&
               parseFloat(this.state.minimalCommission) >= 0 &&
               parseFloat(this.state.minimalCommission) <= 3 &&
               parseFloat(this.state.buySellRateMargin) >= 0 &&
               parseFloat(this.state.buySellRateMargin) <= 2;
       }

       saveSettings(event: any) {
           let that = this;
           let data = {
               'RefreshPeriod': this.state.refreshPeriod,
               'Commission': this.state.commission,
               'Surcharge': this.state.surcharge,
               'MinimalCommission': this.state.minimalCommission,
               'BuySellRateMargin': this.state.buySellRateMargin
           };
           axios.post('/savesettings', data, StoreUtils.authHeader())
               .then(function (response) {
                   that.status="Saved";
                   store.dispatch(updateSettings(data));
                   that.forceUpdate();
               })
               .catch(function (error) {
                   console.log(error);
               });
       }

       render() {
           if (!this.loaded) {
               return <div id="dvSettings">Loading...</div>
           }
           if (this.loaded) {
               console.log('rendering');
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
                                   Commission (0-3):
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
                                   Surcharge (0-3):
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
                                   Minimal Commission(0-3):
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
                                   Buy/Sell rate margin (0-2):
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
                       <span id="spStatus" style={{marginLeft:"1em",fontStyle:"italic"}}>{this.status}</span>
                   </form>
               </div>
           )
       }
   }

export default Admin;