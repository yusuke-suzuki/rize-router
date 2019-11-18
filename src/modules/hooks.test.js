import React from 'react';
import ReactDOM from 'react-dom';
import RouterContext from './RouterContext';
import { useHistory } from './hooks';
import { createBrowserHistory } from 'history';

describe('useHistory', () => {
  const div = document.createElement('div');
  const history = createBrowserHistory();

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  it('returns the history object', () => {
    let myHistory;

    const App = () => {
      myHistory = useHistory();
      return null;
    };

    ReactDOM.render(
      <RouterContext.Provider value={history}>
        <App />
      </RouterContext.Provider>,
      div
    );

    expect(typeof myHistory).toBe('object');
    expect(typeof myHistory.push).toBe('function');
  });
});
