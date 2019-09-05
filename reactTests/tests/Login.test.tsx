import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount, render } from 'enzyme';
import { CELogin } from './../../templates/tsx/Login';

it('test to see if the Login renders correctly', () => {

const component = renderer.create(<CELogin />)
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
