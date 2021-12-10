# Clean Out

### Tools and Technologies

-   [MongoDB] - The database used
-   [Express] - Fast node.js network app framework
-   [React JS] - Javascript library to implement frontend
-   [Node JS] - Javascript engine to implement I/O for the backend
-   [VS Code] - IDE used

### Installation

Clean Out requires [Node JS] v12.16.3+ to run. Clone [this](https://github.com/DarshitNasit/clean-out) project into your machine and open it with any IDE then open terminal in the root folder of the project

Install the dependencies and devDependencies

```sh
npm install
cd client && npm install
```

### Run Code

For production, first go to package.json file and update environment variables of script 'start' according to your requirements then open terminal in the root folder of the project and,

```sh
npm start
```

For development, create an '.env' file in the same folder of 'server.js' file and add folloing variables

-   DATABASE = clean-out
-   DB_SERVER = mongodb://localhost:27017
-   DATE_FORMAT = YYYY-MM-DD
-   DEFAULT_RATING = 2.5
-   SESSION_SECRET = clean-out-secret
-   SESSION_EXPIRE = 600000
-   LIMIT_RATING = 10
-   LIMIT_SERVICES = 10
-   LIMIT_ITEMS = 10
-   LIMIT_WORKERS = 10
-   LIMIT_ORDERS = 10
-   LIMIT_ADMIN = 12
-   ADMIN = userName:x; phone:x; password:x
-   ADMIN_ADDRESS = society:x; area:x; city:x; state:x; pincode:x

Change the variables according to your requirement.

After that,

```sh
npm run dev
```

Finally if you see the message saying that "App is running in development environment on port 5000" then open google chrome or any other browser and then type, http://localhost:3000.

[//]:
[MongoDB]: <https://www.mongodb.com/>
[React JS]: <https://reactjs.org/>
[Node JS]: <https://nodejs.org/en/>
[express]: <https://expressjs.com/>
[VS Code]: <https://code.visualstudio.com/>
