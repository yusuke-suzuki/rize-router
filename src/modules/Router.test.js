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

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('fallback', () => {
    it('redirected to fallback', () => {
      const history = createBrowserHistory();

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
        const history = createBrowserHistory();

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
        const history = createBrowserHistory();

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

  describe('on location change', () => {
    const handleLocationChange = jest.fn();

    beforeEach(() => {
      handleLocationChange.mockReset();
    });

    it('callback function called on location changed', () => {
      const history = createBrowserHistory();

      ReactDOM.render(
        <RouterContext.Provider value={history}>
          <Router
            routes={routes}
            fallback={fallback}
            authenticated={true}
            onLocationChange={handleLocationChange}
          />
        </RouterContext.Provider>,
        div
      );

      act(() => {
        history.push({
          pathname: '/books/1',
          state: { modal: true }
        });
      });

      act(() => {
        history.push('/books');
      });

      expect(handleLocationChange).toBeCalledTimes(2);
      expect(div.innerHTML).toContain('Books');
    });
  });

  describe('modal routing', () => {
    it('location changes but page does not switch', () => {
      const history = createBrowserHistory();

      ReactDOM.render(
        <RouterContext.Provider value={history}>
          <Router routes={routes} fallback={fallback} authenticated={true} />
        </RouterContext.Provider>,
        div
      );

      act(() => {
        history.push('/books');
      });

      act(() => {
        history.push({
          pathname: '/books/1',
          state: { modal: true }
        });
      });

      expect(div.innerHTML).toContain('Books');
    });
  });
});
