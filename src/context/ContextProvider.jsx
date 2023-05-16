import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/auth'
import axios from '../lib/axios'

const StateContext = createContext()

export const ContextProvider = ({children}) => {
    const { user } = useAuth({ middleware: 'guest' })
    const config = {
        headers: {
            Authorization: `Bearer ${user?.plain_text_token}`,
            'Preferred-Language': localStorage.getItem('i18nextLng'),
            'Preferred-Currency': "USD"
        },
    }

    const configFile = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.plain_text_token}`,
            'Preferred-Language': localStorage.getItem('i18nextLng'),

        },
    }

    /* state */
    const [companies, setCompanies] = useState([])
    const [users, setUsers] = useState([])
    const [sites, setSites] = useState([])
    const [roles, setRoles] = useState([])
    const [allSites, setAllSites] = useState([])
    const [choosesite, setChoosesite] = useState(false)
    const [company_id, setCompany_id] = useState('')


    useEffect(() => {
        if(user?.role === "master_admin") {
            getCompanies()
            getUsers()
            getRoles()
        }
        if(user?.role === "office_manager") {
            getUsers()
            getRoles()
        }
        if(user) {
            getAllSites()
            getSites()
        }
    }, [user])

    const getCompanies = async () => {
        await axios.get(`/api/companies`, config)
            .then(res => {
                const companies = res.data
                setCompanies(companies)
            })
    }

    const getUsers = async (role, company, site) => {
        await axios.get(`/api/users?role=${role}&company_id=${company}&site_id=${site}`, config)
            .then(res => {
                const users = res.data
                setUsers(users)
            })
    }

    const getSites = async (id) => {
        await axios.get(`/api/sites?company_id=${id}`, config)
            .then(res => {
                const sites = res.data
                setSites(sites)
            })
    }

    const getRoles = async () => {
        await axios.get(`/api/roles`, config)
            .then(res => {
                const roles = res.data
                setRoles(roles)
            })
    }

    const getAllSites = async() => {
        await axios.get(`/api/sites?with=company`, config)
            .then(res => {
                const sites = res.data
                setAllSites(sites)
            })
            .catch(error => {
                if (error.response.status !== 422) throw error
            })
    }



    return (
        <StateContext.Provider value={{ configFile, user, companies, users, setUsers, getUsers, config, sites, getSites, roles, allSites, choosesite, setChoosesite, company_id, setCompany_id, getCompanies }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext)
