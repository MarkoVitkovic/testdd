import Axios from 'axios'
import i18next from 'i18next'

const axios = Axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
})

axios.interceptors.request.use(
    config => {
        const lang = i18next.resolvedLanguage

        if (lang) {
            config.headers['Preferred-Language'] = lang
        } else {
            config.headers['Preferred-Language'] = 'en'
        }
        return config
    },

    error => Promise.reject(error),
)


export default axios
