import useSWR from 'swr'
import axios from '../lib/axios'
import { useEffect } from 'react'

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {


    const { data: user, error, mutate, isLoading } = useSWR('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => (res.data))
            .catch(error => {
                if (error.response.status !== 409) throw error

                window.location.replace('/verify-email')
            }),


    )

    const csrf = () => axios.get('/sanctum/csrf-cookie')



    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const loginImpersonate = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        return axios
          .get(`/login-impersonate/${props.id}`, props)
          .then((response) => {
            mutate();
            return response.data;
          })
          .catch((error) => {
            if (error.response.status !== 422) throw error;

            setErrors(error.response.data.errors);
          });
    }

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post('/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate())
        }

        window.location.pathname = '/login'
    }

    const logoutImpersonate = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        return axios
          .get("/logout-impersonate", props)
          .then((response) => {
            mutate();
            return response.data;
          })
          .catch((error) => {
            if (error.response.status !== 422) throw error;
            setErrors(error.response.data.error);
          });
    };
    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            window.location.replace(redirectIfAuthenticated)
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        )
            window.location.replace(redirectIfAuthenticated)
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        isLoading,
        login,
        forgotPassword,
        resendEmailVerification,
        logout,
        loginImpersonate,
        logoutImpersonate,
        csrf,
    }
}
