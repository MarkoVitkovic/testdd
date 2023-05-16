import AuthCard from '../../components/AuthCard'
import AuthSessionStatus from '../../components/AuthSessionStatus'
import Button from '../../components/Button'
import GuestLayout from '../../components/Layouts/GuestLayout'
import Input from '../../components/Input'
import InputError from '../../components/InputError'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'
import { useState } from 'react'
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const { forgotPassword } = useAuth({ middleware: 'guest' })
    const { t } = useTranslation();

    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    const submitForm = event => {
        event.preventDefault()

        forgotPassword({ email, setErrors, setStatus })
    }
    return (
        <GuestLayout>
            <AuthCard>
                {/* Session Status */}

                <p className="text-white font-bold text-3xl museosans700 mb-2">{t('reset_password')}</p>
                <form onSubmit={submitForm}>
                    <div className='bg-white px-6 py-4 rounded-xl museosans100 color-dark'>
                        {/* Email Address */}
                        <div className='flex items-center gap-2'>
                            <i className="fa-solid fa-envelope"></i>
                            <Input id="email" type="email" name="email" value={email} className="block w-full" onChange={event => setEmail(event.target.value)} required autoFocus placeholder={t('enter_email')}/>

                        </div>
                        <AuthSessionStatus className="mb-4" status={status} />
                        <InputError messages={errors.email} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Link to="/login" className="text-md text-white hover:text-stone-200 museosans100">
                            {t('login')}
                        </Link>
                        <Button>{t('send_password')}</Button>
                    </div>
                </form>
            </AuthCard>
        </GuestLayout>
    )
}

export default ForgotPassword
