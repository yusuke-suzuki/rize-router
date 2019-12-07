import React, { useMemo, useState, useEffect } from 'react';
import { match } from 'path-to-regexp';
import { useHistory } from './hooks';
import PropTypes from 'prop-types';

const Router = props => {
  const history = useHistory();

  const [currentLocation, setCurrentLocation] = useState(history.location);
  const [previousRoute, setPreviousRoute] = useState(undefined);
  const [params, setParams] = useState({});

  const unlisten = useMemo(() => {
    return history.listen(nextLocation => {
      setCurrentLocation(nextLocation);
    });
  }, [history]);

  useEffect(() => {
    return () => {
      unlisten();
    };
  }, [unlisten]);

  const { routes, fallback, authenticated, authFallback } = props;

  const matchedRoute = useMemo(() => {
    return routes.find(route => {
      const matched = match(route.path)(currentLocation.pathname);

      if (matched) {
        setParams(matched.params);
      }

      return matched;
    });
  }, [currentLocation, routes]);

  useEffect(() => {
    if (previousRoute && currentLocation.state && currentLocation.state.modal) {
      return;
    }

    if (
      !previousRoute &&
      currentLocation.state &&
      currentLocation.state.modal
    ) {
      history.replace({
        pathname: currentLocation.pathname,
        state: undefined
      });
    }

    if (matchedRoute) {
      setPreviousRoute(matchedRoute);
    }
  }, [matchedRoute, currentLocation, previousRoute]);

  if (!matchedRoute) {
    if (!fallback.component) {
      return null;
    }
    if (fallback.path) {
      history.push(fallback.path);
    }
    return <fallback.component location={currentLocation} />;
  }

  if (!authenticated && matchedRoute.requireAuth) {
    if (!authFallback.component) {
      return null;
    }
    if (authFallback.path) {
      history.push(authFallback.path);
    }
    return <authFallback.component location={currentLocation} />;
  }

  if (previousRoute && currentLocation.state && currentLocation.state.modal) {
    return (
      <previousRoute.component params={params} location={currentLocation} />
    );
  }

  return <matchedRoute.component params={params} location={currentLocation} />;
};

Router.defaultProps = {
  routes: [],
  fallback: {},
  authFallback: {},
  authenticated: false
};

Router.propTypes = {
  routes: PropTypes.array.isRequired
};

export default React.memo(Router);
