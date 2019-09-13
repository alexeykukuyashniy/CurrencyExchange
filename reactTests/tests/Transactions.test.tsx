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
    /*expect(wrapper.html()).toEqual('<div id="dvFilters">Currency <div class="p-dropdown p-component"><div class=' +
        '"p-hidden-accessible"><input type="text" role="listbox" readonly=""/></div><div ' +
        'class="p-hidden-accessible p-dropdown-hidden-select"><select tabindex="-1" aria-' +
        'hidden="true"><option value="">Select Currency</option></select></div><label cla' +
        'ss="p-dropdown-label p-inputtext p-placeholder">Select Currency</label><div clas' +
        's="p-dropdown-trigger"><span class="p-dropdown-trigger-icon pi pi-chevron-down p' +
        '-clickable"></span></div><div class="p-dropdown-panel p-hidden p-input-overlay">' +
        '<div class="p-dropdown-items-wrapper" style="max-height:200px"><ul class="p-drop' +
        'down-items p-dropdown-list p-component"></ul></div></div></div><span style="padd' +
        'ing:0 0.5em">Date from </span><span class="p-calendar p-calendar-w-btn"><input t' +
        'ype="text" value="" class="p-inputtext p-component p-inputtext p-component" auto' +
        'Complete="off"/><button type="button" tabindex="-1" class="p-button p-component ' +
        'p-datepicker-trigger p-calendar-button p-button-icon-only"><span class="pi pi-ca' +
        'lendar p-c p-button-icon-left"></span><span class="p-button-text p-c">p-btn</spa' +
        'n></button><div class="p-datepicker p-component p-input-overlay p-shadow"><div c' +
        'lass="p-datepicker-group"><div class="p-datepicker-header"><button class="p-date' +
        'picker-prev p-link"><span class="p-datepicker-prev-icon pi pi-chevron-left"></sp' +
        'an></button><button class="p-datepicker-next p-link"><span class="p-datepicker-n' +
        'ext-icon pi pi-chevron-right"></span></button><div class="p-datepicker-title"><s' +
        'pan class="p-datepicker-month">September</span><span class="p-datepicker-year">2' +
        '019</span></div></div><div class="p-datepicker-calendar-container"><table class=' +
        '"p-datepicker-calendar"><thead><tr><th scope="col"><span>Su</span></th><th scope' +
        '="col"><span>Mo</span></th><th scope="col"><span>Tu</span></th><th scope="col"><' +
        'span>We</span></th><th scope="col"><span>Th</span></th><th scope="col"><span>Fr<' +
        '/span></th><th scope="col"><span>Sa</span></th></tr></thead><tbody><tr><td class' +
        '=""><span class="">1</span></td><td class=""><span class="">2</span></td><td cla' +
        'ss=""><span class="">3</span></td><td class=""><span class="">4</span></td><td c' +
        'lass=""><span class="">5</span></td><td class=""><span class="">6</span></td><td' +
        ' class=""><span class="">7</span></td></tr><tr><td class=""><span class="">8</sp' +
        'an></td><td class=""><span class="">9</span></td><td class=""><span class="">10<' +
        '/span></td><td class=""><span class="">11</span></td><td class=""><span class=""' +
        '>12</span></td><td class="p-datepicker-today"><span class="">13</span></td><td c' +
        'lass=""><span class="">14</span></td></tr><tr><td class=""><span class="">15</sp' +
        'an></td><td class=""><span class="">16</span></td><td class=""><span class="">17' +
        '</span></td><td class=""><span class="">18</span></td><td class=""><span class="' +
        '">19</span></td><td class=""><span class="">20</span></td><td class=""><span cla' +
        'ss="">21</span></td></tr><tr><td class=""><span class="">22</span></td><td class' +
        '=""><span class="">23</span></td><td class=""><span class="">24</span></td><td c' +
        'lass=""><span class="">25</span></td><td class=""><span class="">26</span></td><' +
        'td class=""><span class="">27</span></td><td class=""><span class="">28</span></' +
        'td></tr><tr><td class=""><span class="">29</span></td><td class=""><span class="' +
        '">30</span></td><td class="p-datepicker-other-month"><span class="p-disabled">1<' +
        '/span></td><td class="p-datepicker-other-month"><span class="p-disabled">2</span' +
        '></td><td class="p-datepicker-other-month"><span class="p-disabled">3</span></td' +
        '><td class="p-datepicker-other-month"><span class="p-disabled">4</span></td><td ' +
        'class="p-datepicker-other-month"><span class="p-disabled">5</span></td></tr><tr>' +
        '<td class="p-datepicker-other-month"><span class="p-disabled">6</span></td><td c' +
        'lass="p-datepicker-other-month"><span class="p-disabled">7</span></td><td class=' +
        '"p-datepicker-other-month"><span class="p-disabled">8</span></td><td class="p-da' +
        'tepicker-other-month"><span class="p-disabled">9</span></td><td class="p-datepic' +
        'ker-other-month"><span class="p-disabled">10</span></td><td class="p-datepicker-' +
        'other-month"><span class="p-disabled">11</span></td><td class="p-datepicker-othe' +
        'r-month"><span class="p-disabled">12</span></td></tr></tbody></table></div></div' +
        '><div class="p-timepicker"><div class="p-hour-picker"><button class="p-link"><sp' +
        'an class="pi pi-chevron-up"></span></button><span>12</span><button class="p-link' +
        '"><span class="pi pi-chevron-down"></span></button></div><div class="p-separator' +
        '"><span class="p-separator-spacer"><span class="pi pi-chevron-up"></span></span>' +
        '<span>:</span><span class="p-separator-spacer"><span class="pi pi-chevron-down">' +
        '</span></span></div><div class="p-minute-picker"><button class="p-link"><span cl' +
        'ass="pi pi-chevron-up"></span></button><span>43</span><button class="p-link"><sp' +
        'an class="pi pi-chevron-down"></span></button></div></div></div></span><span sty' +
        'le="padding:0em 0.5em 0em 2.5em">to</span><span class="p-calendar p-calendar-w-b' +
        'tn"><input type="text" value="" class="p-inputtext p-component p-inputtext p-com' +
        'ponent" autoComplete="off"/><button type="button" tabindex="-1" class="p-button ' +
        'p-component p-datepicker-trigger p-calendar-button p-button-icon-only"><span cla' +
        'ss="pi pi-calendar p-c p-button-icon-left"></span><span class="p-button-text p-c' +
        '">p-btn</span></button><div class="p-datepicker p-component p-input-overlay p-sh' +
        'adow"><div class="p-datepicker-group"><div class="p-datepicker-header"><button c' +
        'lass="p-datepicker-prev p-link"><span class="p-datepicker-prev-icon pi pi-chevro' +
        'n-left"></span></button><button class="p-datepicker-next p-link"><span class="p-' +
        'datepicker-next-icon pi pi-chevron-right"></span></button><div class="p-datepick' +
        'er-title"><span class="p-datepicker-month">September</span><span class="p-datepi' +
        'cker-year">2019</span></div></div><div class="p-datepicker-calendar-container"><' +
        'table class="p-datepicker-calendar"><thead><tr><th scope="col"><span>Su</span></' +
        'th><th scope="col"><span>Mo</span></th><th scope="col"><span>Tu</span></th><th s' +
        'cope="col"><span>We</span></th><th scope="col"><span>Th</span></th><th scope="co' +
        'l"><span>Fr</span></th><th scope="col"><span>Sa</span></th></tr></thead><tbody><' +
        'tr><td class=""><span class="">1</span></td><td class=""><span class="">2</span>' +
        '</td><td class=""><span class="">3</span></td><td class=""><span class="">4</spa' +
        'n></td><td class=""><span class="">5</span></td><td class=""><span class="">6</s' +
        'pan></td><td class=""><span class="">7</span></td></tr><tr><td class=""><span cl' +
        'ass="">8</span></td><td class=""><span class="">9</span></td><td class=""><span ' +
        'class="">10</span></td><td class=""><span class="">11</span></td><td class=""><s' +
        'pan class="">12</span></td><td class="p-datepicker-today"><span class="">13</spa' +
        'n></td><td class=""><span class="">14</span></td></tr><tr><td class=""><span cla' +
        'ss="">15</span></td><td class=""><span class="">16</span></td><td class=""><span' +
        ' class="">17</span></td><td class=""><span class="">18</span></td><td class=""><' +
        'span class="">19</span></td><td class=""><span class="">20</span></td><td class=' +
        '""><span class="">21</span></td></tr><tr><td class=""><span class="">22</span></' +
        'td><td class=""><span class="">23</span></td><td class=""><span class="">24</spa' +
        'n></td><td class=""><span class="">25</span></td><td class=""><span class="">26<' +
        '/span></td><td class=""><span class="">27</span></td><td class=""><span class=""' +
        '>28</span></td></tr><tr><td class=""><span class="">29</span></td><td class=""><' +
        'span class="">30</span></td><td class="p-datepicker-other-month"><span class="p-' +
        'disabled">1</span></td><td class="p-datepicker-other-month"><span class="p-disab' +
        'led">2</span></td><td class="p-datepicker-other-month"><span class="p-disabled">' +
        '3</span></td><td class="p-datepicker-other-month"><span class="p-disabled">4</sp' +
        'an></td><td class="p-datepicker-other-month"><span class="p-disabled">5</span></' +
        'td></tr><tr><td class="p-datepicker-other-month"><span class="p-disabled">6</spa' +
        'n></td><td class="p-datepicker-other-month"><span class="p-disabled">7</span></t' +
        'd><td class="p-datepicker-other-month"><span class="p-disabled">8</span></td><td' +
        ' class="p-datepicker-other-month"><span class="p-disabled">9</span></td><td clas' +
        's="p-datepicker-other-month"><span class="p-disabled">10</span></td><td class="p' +
        '-datepicker-other-month"><span class="p-disabled">11</span></td><td class="p-dat' +
        'epicker-other-month"><span class="p-disabled">12</span></td></tr></tbody></table' +
        '></div></div><div class="p-timepicker"><div class="p-hour-picker"><button class=' +
        '"p-link"><span class="pi pi-chevron-up"></span></button><span>12</span><button c' +
        'lass="p-link"><span class="pi pi-chevron-down"></span></button></div><div class=' +
        '"p-separator"><span class="p-separator-spacer"><span class="pi pi-chevron-up"></' +
        'span></span><span>:</span><span class="p-separator-spacer"><span class="pi pi-ch' +
        'evron-down"></span></span></div><div class="p-minute-picker"><button class="p-li' +
        'nk"><span class="pi pi-chevron-up"></span></button><span>40</span><button class=' +
        '"p-link"><span class="pi pi-chevron-down"></span></button></div></div></div></sp' +
        'an><span style="padding:0em 0.5em 0em 2.5em">Transaction Types </span><div class' +
        '="p-dropdown p-component"><div class="p-hidden-accessible"><input type="text" ro' +
        'le="listbox" readonly=""/></div><div class="p-hidden-accessible p-dropdown-hidde' +
        'n-select"><select tabindex="-1" aria-hidden="true"><option value=""></option><op' +
        'tion value="0">All</option></select></div><label class="p-dropdown-label p-input' +
        'text">All</label><div class="p-dropdown-trigger"><span class="p-dropdown-trigger' +
        '-icon pi pi-chevron-down p-clickable"></span></div><div class="p-dropdown-panel ' +
        'p-hidden p-input-overlay"><div class="p-dropdown-items-wrapper" style="max-heigh' +
        't:200px"><ul class="p-dropdown-items p-dropdown-list p-component"><li class="p-d' +
        'ropdown-item p-highlight">All</li><li class="p-dropdown-item">Buy/Sell</li><li c' +
        'lass="p-dropdown-item">Buy</li><li class="p-dropdown-item">Sell</li><li class="p' +
        '-dropdown-item">Send/Receive</li><li class="p-dropdown-item">Send</li><li class=' +
        '"p-dropdown-item">Receive</li><li class="p-dropdown-item">Debit</li><li class="p' +
        '-dropdown-item">Credit</li></ul></div></div></div></div><br/><div id="dvTransact' +
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
        'l style="width:10em"/></colgroup></table></div></div></div></div></div></div>');*/
});
