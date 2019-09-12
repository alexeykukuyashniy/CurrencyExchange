import 'jsdom-global/register';
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Home } from './../../templates/tsx/Home';
import {Provider} from "react-redux";
import store, {StoreUtils} from "./../../templates/tsx/Store";
import {setToken} from "./../../templates/tsx/Actions";

// setup
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

it('test to see if the Home renders correctly', () => {

    const getComponent = () => <Provider store={store}><Home/></Provider>;
    const component = shallow(getComponent()).find(Home).dive();
    component.setState({
            currencycode: "EUR",
            currencyid: 2,
            minimalCurrencyRest: 500,
            rate: 1.1203,
            rates: [{currencyid:2, code:"EUR", buyrate:1.1075, sellrate:1.1203, date:'2019-01-01 12:34:10', amount:100},
                    {currencyid:3, code:"GBP", buyrate:1.2014, sellrate:1.2256, date:'2019-01-02 22:35:12', amount:99.99}
                   ] 
           }/*, callback*/);

    expect(component.html()).toEqual('<div id="dvHome"><div class="p-datatable p-component"><div cl' +
        'ass="p-datatable-wrapper"><table><thead class="p-datatable-thead"><tr><th cl' +
        'ass="" style="width:13em"><span class="p-column-title">Currency</span></th' +
        '><th class=""><span class="p-column-title">Buy</span></th><th class=""><sp' +
        'an class="p-column-title">Sell</span></th><th class=""><span class="p-colum' +
        'n-title"></span></th><th class=""><span class="p-column-title">Amount</span' +
        '></th></tr></thead><tbody class="p-datatable-tbody"><tr class="p-datatable-ro' +
        'w" style="height:28px"><td class="" style="width:13em"></td><td class="' +
        '"><button type="button" op="buy" currencyid="2" currencycode="EUR" rate=' +
        '"1.1075" class="p-button p-component"><span class="p-button-text p-c">p-bt' +
        'n</span>1.1075</button></td><td class=""><button type="button" op="sell" c' +
        'urrencyid="2" currencycode="EUR" rate="1.1203" class="p-button p-componen' +
        't"><span class="p-button-text p-c">p-btn</span>1.1203</button></td><td class=' +
        '""><img src="./static/images/eur.png"/></td><td class=""><button type="bu' +
        'tton" op="tr" currencyid="2" currencycode="EUR" class="p-button p-compon' +
        'ent btnRed"><span class="p-button-text p-c">p-btn</span>100</button></td></tr' +
        '><tr class="p-datatable-row" style="height:28px"><td class="" style="widt' +
        'h:13em"></td><td class=""><button type="button" op="buy" currencyid="3"' +
        ' currencycode="GBP" rate="1.2014" class="p-button p-component"><span class' +
        '="p-button-text p-c">p-btn</span>1.2014</button></td><td class=""><button ty' +
        'pe="button" op="sell" currencyid="3" currencycode="GBP" rate="1.2256" ' +
        'class="p-button p-component"><span class="p-button-text p-c">p-btn</span>1.2' +
        '256</button></td><td class=""><img src="./static/images/gbp.png"/></td><td c' +
        'lass=""><button type="button" op="tr" currencyid="3" currencycode="GBP' +
        '" class="p-button p-component btnRed"><span class="p-button-text p-c">p-btn<' +
        '/span>99.99</button></td></tr></tbody></table></div></div><br/></div>');
});

