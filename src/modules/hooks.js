import { useContext } from 'react';
import Context from './RouterContext.js';

export function useHistory() {
  return useContext(Context);
}
