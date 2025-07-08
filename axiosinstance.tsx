import axios from 'axios';

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
    baseURL: 'https://localhost:7192/api',
});
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
export default axiosInstance;
