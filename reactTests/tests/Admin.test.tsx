//import 'jsdom-global/register';
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Admin } from './../../templates/tsx/Admin';

//import renderer from 'react-test-renderer';

// setup
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

it('test to see if the Admin renders correctly', () => {
    const wrapper = shallow(<Admin />, {disableLifecycleMethods:true});
    (wrapper.instance() as Admin).loaded = true;
    wrapper.setState({
        buySellRateMargin: 1,
        commission: 1,
        minimalCommission : 2,
        refreshPeriod : 0,
        surcharge : 3
    });
    wrapper.update();
    expect(wrapper.html()).toEqual('<div id="dvSettings">' +
        '<form method="POST"><h5>Change setting below and click Update</h5>' +
        '<div class="horizontal-rule"></div><table class="tblSetting"><tbody><tr>' +
        '<td>Refresh currency exchange rates every </td><td>' +
        '<input type="text" name="RefreshPeriod" value="0"/> seconds (0-60)</td></tr><tr><td>Commission, % (0-3):</td>' +
        '<td><input type="text" name="Commission" value="1"/></td></tr><tr><td>Surcharge, USD (0-3):</td>' +
        '<td><input type="text" name="Surcharge" value="3"/></td></tr><tr><td>Minimal Commission, USD (0-3):</td>' +
        '<td><input type="text" name="MinimalCommission" value="2"/></td></tr><tr>' +
        '<td>Buy/Sell rate margin, % (0-2):</td><td><input type="text" name="BuySellRateMargin" value="1"/></td></tr>' +
        '</tbody></table><div class="horizontal-rule"></div><input type="button" value="Update" disabled=""/>' +
        '<span id="spStatus" style="margin-left:1em;font-style:italic"></span></form></div>');
});
