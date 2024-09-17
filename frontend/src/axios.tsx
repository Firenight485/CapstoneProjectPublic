import axios from 'axios';


const base_url = process.env.NODE_ENV === 'development' ? "http://localhost:8000/" : 'https://api.cruxconditions.live';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withXSRFToken = true;
axios.defaults.withCredentials = true;

export const axios_instance = axios.create({
  baseURL: base_url,
  timeout: 10000,
});