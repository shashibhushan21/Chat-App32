import axios from 'axios';


const baseURL = import.meta.env.PROD 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});