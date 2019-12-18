import React, { useMemo, useState, useEffect } from 'react';
import { match } from 'path-to-regexp';
import { useHistory } from './hooks';
import PropTypes from 'prop-types';

const Router = props => {
  const {
    routes,
    fallback,
    authenticated,
    authFallback,
    onLocationChange
  } = props;

  const history = useHistory();

  const [currentLocation, setCurrentLocation] = useState(history.location);
  const [previousRoute, setPreviousRoute] = useState(undefined);
  const [params, setParams] = useState({});

  const matchedRoute = useMemo(() => {
    return routes.find(route => {
      const matched = match(route.path)(currentLocation.pathname);

      if (matched) {
        setParams(matched.params);
      }

      return matched;
    });
  }, [currentLocation, routes]);

  const isModalLocation = useMemo(() => {
    return (
      previousRoute && currentLocation.state && currentLocation.state.modal
    );
  }, [previousRoute, currentLocation]);

  const willReplaceModalLocation = useMemo(() => {
    return (
      !previousRoute && currentLocation.state && currentLocation.state.modal
    );
  }, [previousRoute, currentLocation]);

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

  useEffect(() => {
    if (willReplaceModalLocation) {
      history.replace({
        pathname: currentLocation.pathname,
        state: undefined
      });
      return;
    }

    onLocationChange(currentLocation);
  }, [willReplaceModalLocation, currentLocation]);

  useEffect(() => {
    if (isModalLocation) {
      return;
    }
    if (matchedRoute) {
      setPreviousRoute(matchedRoute);
    }
  }, [matchedRoute, isModalLocation]);

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

  return isModalLocation ? (
    <previousRoute.component params={params} location={currentLocation} />
  ) : (
    <matchedRoute.component params={params} location={currentLocation} />
  );
};

Router.defaultProps = {
  routes: [],
  fallback: {},
  authFallback: {},
  authenticated: false,
  onLocationChange: () => {}
};

Router.propTypes = {
  routes: PropTypes.array.isRequired,
  onLocationChange: PropTypes.func
};

export default React.memo(Router);
