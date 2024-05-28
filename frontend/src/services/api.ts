import axios from 'axios';

const api = axios.create({
    baseURL: "https://batalha-naval-8j8a.onrender.com"
    // baseURL: 'http://localhost:3333'
});

export default api;