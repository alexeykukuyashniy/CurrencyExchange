import 'jsdom-global/register';
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Transactions } from './../../templates/tsx/Transactions';

// setup
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

it('test to see if the Transactions renders correctly', () => {
    const wrapper = shallow(<Transactions/>, {disableLifecycleMethods: true});
    (wrapper.instance() as Transactions).loaded = true;
    (wrapper.instance() as Transactions).fetchCurrency = jest.fn( () => { return false; });
    wrapper.setState({
            data: [{
                date: "2014-05-26 12:34:21",
                code: "EUR",
                amount: "100",
                transactiontype: "buy",
                commission: "2.34",
                rate: "1.20",
                note: "test note",
                username: "user1"
            },
                {
                    date: "2014-05-27 12:34:22",
                    code: "GBP",
                    amount: "101",
                    transactiontype: "sell",
                    commission: "2.35",
                    rate: "1.35",
                    note: "test note2",
                    username: "user2"
                }]
        }
    );
    wrapper.update();
    // check transactions data html
    expect(wrapper.html()).toContain('<div id="dvTransact' +
        'ions"><div class="p-datatable p-component p-datatable-scrollable"><div class="p-' +
        'datatable-scrollable-wrapper"><div class="p-datatable-scrollable-view" style="wi' +
        'dth:calc(100% - null)"><div class="p-datatable-scrollable-header"><div class="p-' +
        'datatable-scrollable-header-box"><table class="p-datatable-scrollable-header-tab' +
        'le"><colgroup class="p-datatable-scrollable-colgroup"><col style="width:12em"/><' +
        'col style="text-align:center;width:8em"/><col style="text-align:right;width:7em"' +
        '/><col style="text-align:right;width:5em"/><col style="text-align:right;width:10' +
        'em"/><col style="text-align:right;width:11em"/><col style="width:15em"/><col sty' +
        'le="width:10em"/></colgroup><thead class="p-datatable-thead"><tr><th tabindex="0' +
        '" class="p-sortable-column" style="width:12em"><span class="p-column-title">Date' +
        '/Time</span><span class="p-sortable-column-icon pi pi-fw pi-sort"></span></th><t' +
        'h tabindex="0" class="p-sortable-column" style="text-align:center;width:8em"><sp' +
        'an class="p-column-title">Currency</span><span class="p-sortable-column-icon pi ' +
        'pi-fw pi-sort"></span></th><th tabindex="0" class="p-sortable-column" style="tex' +
        't-align:right;width:7em"><span class="p-column-title">Amount</span><span class="' +
        'p-sortable-column-icon pi pi-fw pi-sort"></span></th><th tabindex="0" class="p-s' +
        'ortable-column" style="text-align:right;width:5em"><span class="p-column-title">' +
        'Type</span><span class="p-sortable-column-icon pi pi-fw pi-sort"></span></th><th' +
        ' tabindex="0" class="p-sortable-column" style="text-align:right;width:10em"><spa' +
        'n class="p-column-title">Commission</span><span class="p-sortable-column-icon pi' +
        ' pi-fw pi-sort"></span></th><th tabindex="0" class="p-sortable-column" style="te' +
        'xt-align:right;width:11em"><span class="p-column-title">Exchange Rate</span><spa' +
        'n class="p-sortable-column-icon pi pi-fw pi-sort"></span></th><th tabindex="0" c' +
        'lass="p-sortable-column" style="width:15em"><span class="p-column-title">Note</s' +
        'pan><span class="p-sortable-column-icon pi pi-fw pi-sort"></span></th><th tabind' +
        'ex="0" class="p-sortable-column" style="width:10em"><span class="p-column-title"' +
        '>User</span><span class="p-sortable-column-icon pi pi-fw pi-sort"></span></th></' +
        'tr></thead></table></div></div><div class="p-datatable-scrollable-body"><table s' +
        'tyle="top:0" class="p-datatable-scrollable-body-table"><colgroup class="p-datata' +
        'ble-scrollable-colgroup"><col style="width:12em"/><col style="text-align:center;' +
        'width:8em"/><col style="text-align:right;width:7em"/><col style="text-align:righ' +
        't;width:5em"/><col style="text-align:right;width:10em"/><col style="text-align:r' +
        'ight;width:11em"/><col style="width:15em"/><col style="width:10em"/></colgroup><' +
        'tbody class="p-datatable-tbody"><tr class="p-datatable-row" style="height:28px">' +
        '<td class="" style="width:12em">2014-05-26 12:34:21</td><td class="" style="text' +
        '-align:center;width:8em">EUR</td><td class="" style="text-align:right;width:7em"' +
        '>100</td><td class="" style="text-align:right;width:5em">buy</td><td class="" st' +
        'yle="text-align:right;width:10em">2.34</td><td class="" style="text-align:right;' +
        'width:11em">1.20</td><td class="" style="width:15em">test note</td><td class="" ' +
        'style="width:10em">user1</td></tr><tr class="p-datatable-row" style="height:28px' +
        '"><td class="" style="width:12em">2014-05-27 12:34:22</td><td class="" style="te' +
        'xt-align:center;width:8em">GBP</td><td class="" style="text-align:right;width:7e' +
        'm">101</td><td class="" style="text-align:right;width:5em">sell</td><td class=""' +
        ' style="text-align:right;width:10em">2.35</td><td class="" style="text-align:rig' +
        'ht;width:11em">1.35</td><td class="" style="width:15em">test note2</td><td class' +
        '="" style="width:10em">user2</td></tr></tbody></table><div class="p-datatable-vi' +
        'rtual-scroller"></div></div><div class="p-datatable-scrollable-footer"><div clas' +
        's="p-datatable-scrollable-footer-box"><table class="p-datatable-scrollable-foote' +
        'r-table"><colgroup class="p-datatable-scrollable-colgroup"><col style="width:12e' +
        'm"/><col style="text-align:center;width:8em"/><col style="text-align:right;width' +
        ':7em"/><col style="text-align:right;width:5em"/><col style="text-align:right;wid' +
        'th:10em"/><col style="text-align:right;width:11em"/><col style="width:15em"/><co' +
        'l style="width:10em"/></colgroup></table></div></div></div></div>');
   });
