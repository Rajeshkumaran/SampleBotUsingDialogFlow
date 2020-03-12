import { get } from './helpers';
const responseParser = (response, keyToSelect, defaultValue = '') => {
  return get(response, keyToSelect ? `data.${keyToSelect}` : 'data', '');
};
export default responseParser;
