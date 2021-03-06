# rize-router

A routing library for React SPA with simple auth,
powered by:

- [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- [history](https://github.com/ReactTraining/history)

## Install

```
yarn add @yusuke-suzuki/rize-router
```

## Quick Start

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom';

import { StoreContext } from 'redux-react-hook';
import configureStore from './configureStore';

import { createBrowserHistory } from 'history';
import { RouterContext } from '@yusuke-suzuki/rize-router';

import App from './App';

const { store } = configureStore();
const history = createBrowserHistory();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <RouterContext.Provider value={history}>
      <App />
    </RouterContext.Provider>
  </StoreContext.Provider>,
  document.getElementById('root')
);
```

```jsx
// App.js
import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';

import { Router } from '@yusuke-suzuki/rize-router';
import routes from './routes';

import Login from './pages/Login';
import NotFound from './pages/NotFound';

const App = () => {
  const mapState = useCallback(
    state => ({
      user: state.auth.user
    }),
    []
  );
  const { user } = useMappedState(mapState);

  return (
    <Router
      routes={routes}
      fallback={{
        path: '',
        component: NotFound
      }}
      authFallback={{
        path: '/login',
        component: Login
      }}
      authenticated={user ? true : false}
    />
  );
};

export default App;
```

```js
// routes.js
import Books from './pages/Books';
import BookInfo from './pages/BookInfo';
import Login from './pages/Login';

const routes = [
  {
    path: '/',
    component: Books,
    requireAuth: true
  },
  {
    path: '/books',
    component: Books,
    requireAuth: true
  },
  {
    path: '/books/:id',
    component: BookInfo,
    requireAuth: true
  },
  {
    path: '/login',
    component: Login,
    requireAuth: false
  }
];

export default routes;
```

## Usage

### `RouterContext`

Before you can use the router, you must provide the [history](https://github.com/ReactTraining/history) object via `RouterContext.Provider`:

```jsx
import { createBrowserHistory } from 'history';
import { RouterContext } from '@yusuke-suzuki/rize-router';

const history = createBrowserHistory();

ReactDOM.render(
  <RouterContext.Provider value={history}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('root')
);
```

### `Router`

#### routes: array

An array of route object.
Each route object have following properties:

- path: Any valid URL path that [path-to-regexp](https://github.com/pillarjs/path-to-regexp) understands.
- component: A React component to be rendered.
- requireAuth: Whether the route requires authentication. If `requireAuth` is set to `true` and the current value of `authenticated` is `false`, it will be redirected to the route specified in `authFallback`.

#### fallback: object (optional)

An object that have following properties:

- path: Any valid URL path that [path-to-regexp](https://github.com/pillarjs/path-to-regexp) understands. If the corresponding path is not defined in `routes`, it will be pushed to this path as fallback.
- component: A React component to be rendered. If the corresponding path is not defined in `routes`, this component will be rendered as fallback.

#### authFallback: object (optional)

An object that have following properties:

- path: Any valid URL path that [path-to-regexp](https://github.com/pillarjs/path-to-regexp) understands.
- component: A React component to be rendered.

#### authenticated: bool (optional)

The current authentication state in your application.
Required if using `authFallback`.

#### onLocationChange: func (optional)

You can listen for changes to the current location using `onLocationChange`:

```jsx
import React, { useCallback } from 'react';

import { Router } from '@yusuke-suzuki/rize-router';
import routes from './routes';

const App = () => {
  const handleLocationChange = useCallback(location => {
    console.log(location);
  }, []);

  return <Router routes={routes} onLocationChange={handleLocationChange} />;
};

export default App;
```

### `props.params`

Each React component defined in `routes` can receive parameters from path via `props`.

```jsx
import React from 'react';

const BookInfo = props => {
  console.log(props.params); //=> { id: '100' } }

  return <div>Book Info</div>;
};
```

### `Link`

Provides declarative, accessible navigation around your application.

```jsx
import React from 'react';
import { Link } from '@yusuke-suzuki/rize-router';

const Books = () => {
  return <Link to="/books/100">MyBook 100</Link>;
};
```

#### With [Material-UI](https://github.com/mui-org/material-ui)

```jsx
import React from 'react';
import { Link } from '@yusuke-suzuki/rize-router';
import Button from '@material-ui/core/Button';

const Books = () => {
  return (
    <Button component={Link} to="/books/100">
      MyBook 100
    </Button>
  );
};
```

### `useHistory`

Simply returns the [history](https://github.com/ReactTraining/history) object.

```jsx
import React, { useCallback } from 'react';
import { useHistory } from '@yusuke-suzuki/rize-router';

const Books = () => {
  const history = useHistory();

  const handleBookClick = useCallback(
    bookId => {
      history.push(`/books/${bookId}`);
    },
    [history]
  );

  return <Button onClick={() => handleBookClick(100)}>MyBook 100</Button>;
};
```

#### Modal Route

You can create a modal route using `location.state.modal`.

If you call `history.push` with `state: { modal: true }`, `Router` will render the previous route.

This means that you can open your dialogs without re-rendering the page, also switch to the location specified in `pathname`.

If you visit the site directly and there is no previous route, `Router` will render the route that matches the current path, regardless of whether `state.modal` is specified.

1. Call `history.push` or using `Link` with `state.modal`:

```jsx
import React, { useCallback } from 'react';
import { useHistory } from '@yusuke-suzuki/rize-router';

const Books = () => {
  const history = useHistory();

  const handleBookClick = useCallback(
    bookId => {
      history.push({
        pathname: `/books/${bookId}`,
        state: {
          modal: true,
          book: myBook
        }
      });
    },
    [history]
  );

  return <Button onClick={() => handleBookClick(100)}>MyBook 100</Button>;
};

export default Books;
```

2. Open / Close your dialog on location changed:

```jsx
import React, { useMemo, useEffect, useCallback } from 'react';
import { useHistory } from '@yusuke-suzuki/rize-router';
import { match } from 'path-to-regexp';

import Dialog from '@material-ui/core/Dialog';

const BookInfoDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(undefined);

  const history = useHistory();

  const unlisten = useMemo(() => {
    return history.listen(location => {
      const matched = match('/books/:bookId')(location.pathname);

      if (matched && location.state && location.state.modal) {
        setCurrentBook(location.state.book);
        setDialogOpen(true);
      } else {
        setDialogOpen(false);
      }
    });
  }, [history]);

  const handleRequestDialogClose = useCallback(() => {
    history.goBack();
  }, [history]);

  useEffect(() => {
    return () => {
      unlisten();
    };
  }, [unlisten]);

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose}>
      This is book info dialog.
    </Dialog>
  );
};
```
