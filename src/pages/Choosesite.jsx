import React, { useState, useEffect } from 'react'

import { useTranslation } from "react-i18next"
import { Navigate, useLocation } from "react-router-dom"

import { useStateContext } from '../context/ContextProvider'
import GuestLayout from '../components/Layouts/GuestLayout'
import AuthCard from '../components/AuthCard'
import Button from '../components/Button'


const Choosesite = () => {
    const { choosesite, setChoosesite, allSites, company_id, setCompany_id } = useStateContext()
    const { t } = useTranslation()
    const [choosedSite, setChoosedSite] = useState('')
    const location = useLocation()
    const [disabeled, setDisabeled] = useState(true)
    const [buttonDisabeled, setButtonDisabeled] = useState(false)

    const setSite = () => {
        localStorage.setItem('site', choosedSite)
        setChoosesite(choosedSite)
    }

    useEffect(() => {
        chechSiteLength()
    }, [allSites])

    const chechSiteLength = () => {
        if (allSites.length == 1) {
            localStorage.setItem('site', allSites[0].id)
            localStorage.setItem('company_id', allSites[0].company_id)
            setChoosesite(localStorage.getItem('site'))
            setCompany_id(localStorage.getItem('company_id'))
        }
    }

    const setCompanyId = (e) => {
        localStorage.setItem('company_id', e)
        setCompany_id(e)
    }


    if (choosesite == false)
        return (
            <>
                <GuestLayout>
                    <AuthCard>
                        <p className="text-white font-bold text-3xl museosans700 mb-2 uppercase">{t('choosesite')}</p>

                        <div className='bg-white px-6 py-4 rounded-xl museosans100 color-dark'>
                            <div>
                                <div className='flex items-center gap-2'>
                                    <select className='w-full rounded-md border-gray-300' name="choosesite" id="choosesite" onChange={(e) => {setChoosedSite(e.target.value); setDisabeled(false); setButtonDisabeled(true); setCompanyId(e.target.selectedOptions[0].attributes.company.value)}}>
                                        <option value="false" disabled={buttonDisabeled}>Choose site..</option>
                                        {allSites.map((item, index) => <option key={index} value={item.id} company={item.company_id}>{item?.company?.name} - {item.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-4">
                            <Button className={`ml-3`} disabled={disabeled} onClick={() => setSite()}>{t("go")}</Button>
                        </div>
                    </AuthCard>
                </GuestLayout>
            </>
        )
    else {
        return <Navigate to="/" state={{ from: location }} replace />
    }

}

export default Choosesite
