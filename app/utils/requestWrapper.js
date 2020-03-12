import axios from 'axios';
import { get } from './helpers';
const responseInterceptor = axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return get(error, 'response', {});
  },
);
const axiosWrapper = options => {
  let configs = options;
  return axios.request({ ...configs });
};
export default axiosWrapper;
