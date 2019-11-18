import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import Link from './Link';
import RouterContext from './RouterContext';
import { createBrowserHistory } from 'history';

describe('<Link>', () => {
  const div = document.createElement('div');
  const history = createBrowserHistory();
  history.push = jest.fn();

  beforeEach(() => {
    history.push.mockReset();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('with no `to` prop', () => {
    it('logs an error to the console', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      ReactDOM.render(
        <RouterContext.Provider value={history}>
          <Link>no link</Link>
        </RouterContext.Provider>,
        div
      );

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('The prop `to` is marked as required')
      );
    });
  });

  it('accepts a string `to` prop', () => {
    const to = '/the/path?the=query#the-hash';

    ReactDOM.render(
      <RouterContext.Provider value={history}>
        <Link to={to}>link</Link>
      </RouterContext.Provider>,
      div
    );

    const a = div.querySelector('a');

    expect(a.getAttribute('href')).toEqual('/the/path?the=query#the-hash');
  });

  it('accepts an object `to` prop', () => {
    const to = {
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash'
    };

    ReactDOM.render(
      <RouterContext.Provider value={history}>
        <Link to={to}>link</Link>
      </RouterContext.Provider>,
      div
    );

    const a = div.querySelector('a');

    expect(a.getAttribute('href')).toEqual('/the/path?the=query#the-hash');
  });

  describe('simulate click event', () => {
    it('calls history.push', () => {
      const to = '/the/path?the=query#the-hash';

      ReactDOM.render(
        <RouterContext.Provider value={history}>
          <Link to={to}>link</Link>
        </RouterContext.Provider>,
        div
      );

      const a = div.querySelector('a');

      TestUtils.Simulate.click(a, {
        defaultPrevented: false,
        button: 0
      });

      expect(history.push).toBeCalledTimes(1);
      expect(history.push).toBeCalledWith(to);
    });
  });
});
