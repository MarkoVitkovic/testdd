# pallet-new-app-frontend

## Prerequesites

- NodeJS
- VirtualBox
- Vagrant
- HyperV **OFF**

## Setup

1. Add the following domain and subdomain to your hosts file (located @ _C:\Windows\System32\drivers\etc\hosts_):

```
    192.168.10.10 pallet-insights.test
    192.168.10.10 api.pallet-insights.test
```

2. Clone this repository to a location of your choosing

```
mkdir ~/gitlab-projects
cd ~/gitlab-projects
git clone --recurse-submodules git@gitlab.com:helioz/pallet-new-app.git
cd pallet-new-app
cp ./Homestead.yaml.example ./Homestead.yaml
cp ./.env.example ./.env
```

3. In the **Homestead.yaml** file, set the proper mapping for both the backend and frontend: 

```
folders:
  - map: 'C:\Users\[YOUR-NAME]\gitlab-projects\pallet-new-app'
    to: /home/vagrant/code/backend
  - map: 'C:\Users\[YOUR-NAME]\gitlab-projects\pallet-new-app\pallet-insights-frontend'
    to: /home/vagrant/code/frontend
```

4. In the **.env** file, set the following variables:

```
APP_URL=http://api.pallet-insights.test
FRONTEND_URL=http://pallet-insights.test:3000
SESSION_DOMAIN=.pallet-insights.test
SANCTUM_STATEFUL_DOMAINS=api.pallet-insights.test,pallet-insights.test:3000
```

5. In the **.env** file (frontend), set the following variables:

```
REACT_APP_BACKEND_URL=http://api.pallet-insights.test
```

6. Run the following commands:

```
cd pallet-insights-frontend
npm install
```

7. Boot up Vagrant in the project's directory

`vagrant up`

8. SSH into Vagrant and run the frontend

```
cd code/frontend
npm run start
```

## Frequently Encountered Inconveniences
- If everything appears to boot up without issue, but you still get a _502 Bad Gateway_ error while trying to visit the backend (api.pallet-insights.test): check the **Homestead.yaml** file and make sure that the PHP version explicitly defined for the backend is "8.1".

```
sites:
  - map: api.pallet-insights.test
    to: /home/vagrant/code/backend/public
    php: "8.1" # DO NOT set to "8.2"
```

- If everything appears to boot up without issue AND you avoid the aforementioned error, BUT you now get a _403 Forbidden_ error while trying to visit the frontend (pallet-insights.test): make sure you are visiting the :3000 port specifically - i.e., pallet-insights.test:3000

## Other Things Of Note
- This repository contains a submodule or a nested repository (pallet-insights-frontend) which is - as you might have guessed - the frontend of the application.
- The API documentation is located on api.pallet-insights.test/docs.


## Environments

```
[Development server](https://dev.pallet-insights.com/)
[QA server](https://qa.pallet-insights.com/)
```

## Credentials

```
username: admin@admin.com
password: password

If you want another user password is always `password`, and you can login with folowing email's:

- admin@admin.com
- office@office.com
- sales@sales.com
- client@client.com
- forklifter@forklifter.com
- driver@driver.com
- super@super.com
- dispatcher@dispatcher.com
```
