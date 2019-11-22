import React, { useRef, useCallback, useMemo } from 'react';
import { useHistory } from './hooks';
import PropTypes from 'prop-types';

const isModifiedEvent = event => {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

const Link = React.forwardRef((props, ref) => {
  const history = useHistory();
  const innerRef = useRef(ref);

  const { to, ...rest } = props;

  const handleClick = useCallback(
    event => {
      if (event.button === 0 && !isModifiedEvent(event)) {
        event.preventDefault();

        history.push(to);
      }
    },
    [history, to]
  );

  const href = useMemo(() => {
    if (!to) {
      return '';
    }
    if (typeof to === 'string') {
      return to;
    } else if (typeof to === 'object') {
      return history.createHref({
        pathname: to.pathname,
        search: to.search,
        hash: to.hash
      });
    }
  }, [to]);

  return <a {...rest} onClick={handleClick} href={href} ref={innerRef} />;
});

Link.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};

export default React.memo(Link);
