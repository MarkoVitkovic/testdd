import React, { useEffect, useState } from 'react'

import { useTranslation } from "react-i18next"
import { Link } from 'react-router-dom'

import AuthCard from '../../components/AuthCard'
import AuthSessionStatus from '../../components/AuthSessionStatus'
import Button from '../../components/Button'
import GuestLayout from '../../components/Layouts/GuestLayout'
import Input from '../../components/Input'
import InputError from '../../components/InputError'
import { useAuth } from '../../hooks/auth'
import { useStateContext } from '../../context/ContextProvider'


const Login = () => {

    const { t } = useTranslation();
    const { setChoosesite } = useStateContext()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/choosesite',
    })

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [shouldRemember, setShouldRemember] = useState(false)
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    const submitForm = async event => {
        event.preventDefault()
        setChoosesite(false)
        localStorage.removeItem('site')

        login({
            email,
            password,
            remember: shouldRemember,
            setErrors,
            setStatus,
        })
    }
  return (
    <GuestLayout>

            <AuthCard>
                {/* Session Status */}
                <AuthSessionStatus className="mb-4" status={status} />
                <p className="text-white font-bold text-3xl museosans700 mb-2 uppercase">{t('login')}</p>
                <form onSubmit={submitForm}>
                    <div className='bg-white px-6 py-4 rounded-xl museosans100 color-dark'>
                        {/* Email Address */}
                        <div className='mb-4'>
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-envelope"></i>
                                <Input id="email" type="email" value={email} className="block w-full" onChange={event => setEmail(event.target.value)} required autoFocus placeholder={t('enter_email')} />
                            </div>
                            <InputError messages={errors.email} className="mt-2" />
                        </div>
                        <hr />
                        {/* Password */}
                        <div className="mt-4">
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-lock"></i>
                                <Input id="password" type="password" value={password} className="block w-full" onChange={event => setPassword(event.target.value)} required autoComplete="current-password" placeholder={t('password')} />
                            </div>
                            <InputError messages={errors.password} className="mt-2" />
                        </div>
                    </div>

                    {/* Remember Me */}
                    {/* <div className="block mt-4">
                        <label htmlFor="remember_me" className="inline-flex items-center">
                            <input id="remember_me" type="checkbox" name="remember" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                onChange={event =>
                                    setShouldRemember(event.target.checked)
                                }
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>
                    </div> */}

                    <div className="flex items-center justify-between mt-4">
                        <Link to="/forgot-password" className="text-md text-white hover:text-stone-200 museosans100">
                            {t('forgot_password')}
                        </Link>
                        <Button className="ml-3">{t("login")}</Button>
                    </div>
                </form>
            </AuthCard>
        </GuestLayout>
  )
}

export default Login
