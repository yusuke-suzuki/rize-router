import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Router from './Router';
import RouterContext from './RouterContext';
import { createBrowserHistory } from 'history';

const Books = props => {
  return <div>Books</div>;
};

const BookInfo = props => {
  return <div>BookInfo</div>;
};

const Login = props => {
  return <div>Login</div>;
};

const NotFound = props => {
  return <div>NotFound</div>;
};

const routes = [
  {
    path: '/books',
    component: Books,
    requireAuth: true
  },
  {
    path: '/books/:bookId',
    component: BookInfo,
    requireAuth: true
  },
  {
    path: '/login',
    component: Login
  }
];

const fallback = {
  component: NotFound
};

const authFallback = {
  path: '/login',
  component: Login
};

describe('<Router>', () => {
  const div = document.createElement('div');
  const history = createBrowserHistory();

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('fallback', () => {
    it('redirected to fallback', () => {
      ReactDOM.render(
        <RouterContext.Provider value={history}>
          <Router routes={routes} fallback={fallback} />
        </RouterContext.Provider>,
        div
      );

      act(() => {
        history.push('/somewhere');
      });

      expect(div.innerHTML).toContain('NotFound');
      expect(div.innerHTML).not.toContain('Books');
    });
  });

  describe('authFallback', () => {
    describe('unauthorized', () => {
      it('redirected to authFallback', () => {
        ReactDOM.render(
          <RouterContext.Provider value={history}>
            <Router
              routes={routes}
              fallback={fallback}
              authFallback={authFallback}
              authenticated={false}
            />
          </RouterContext.Provider>,
          div
        );

        act(() => {
          history.push('/books');
        });

        expect(div.innerHTML).toContain('Login');
        expect(div.innerHTML).not.toContain('Books');
      });
    });

    describe('authorized', () => {
      it('directely pushed', () => {
        ReactDOM.render(
          <RouterContext.Provider value={history}>
            <Router
              routes={routes}
              fallback={fallback}
              authFallback={authFallback}
              authenticated={true}
            />
          </RouterContext.Provider>,
          div
        );

        act(() => {
          history.push('/books');
        });

        expect(div.innerHTML).not.toContain('Login');
        expect(div.innerHTML).toContain('Books');
      });
    });
  });
});
