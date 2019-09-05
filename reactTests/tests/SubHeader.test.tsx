 import 'jsdom-global/register';
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { CESubHeader } from './../../templates/tsx/SubHeader';

// setup
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

it('test to see if the SubHeader renders correctly', () => {

  const wrapper = mount(<CESubHeader />);

  (wrapper as unknown as CESubHeader).isLoginPage = jest.fn( () => { return false; } );

  wrapper.setState({minimalCurrencyRest: 1000,
                   rateDate: '2019-08-30 12:34:56',
                   refreshPeriod: 0,
                   usdCash: 999
                  });

  wrapper.update();

  expect(wrapper.text()).toEqual("Exchange Rates shown as per 2019-08-30 12:34:56. You have 999 USD left.");
});
