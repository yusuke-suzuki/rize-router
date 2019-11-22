import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import RouterContext from './RouterContext';

describe('<RouterContext>', () => {
  const div = document.createElement('div');
  const history = createBrowserHistory();

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  it('has a `history` as value', () => {
    let context;

    const App = () => {
      return (
        <RouterContext.Consumer>
          {value => {
            context = value;
            return null;
          }}
        </RouterContext.Consumer>
      );
    };

    ReactDOM.render(
      <RouterContext.Provider value={history}>
        <App />
      </RouterContext.Provider>,
      div
    );

    expect(context).toBe(history);
  });
});
