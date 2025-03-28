import apiClient from "./apiClient";
const login = (email, password) => apiClient.post('/auth', { email, password })

export default {
    login,
}