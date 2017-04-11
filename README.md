## Brew API

a restful beer API using OpenBeerDB data

## Setup

- Download the source code or clone this git repository.

- install dependencies :
  `npm install` or `yarn` in root project folder  
  (you need to have `babel`, `concurrently` and `nodemon` installed **globally** to run npm scripts).

- to run server in watch mode for development, use `npm run dev`.

- to build server for deployment, use `npm run build`.

- to generate documentation, use `npm run make-doc`.

### Database setup

To initialize database, use the raw SQL migration file in `brewAPI.sql.zip`, it contains all database tables and generation code in MySQL syntax.

You can modify database connection settings in `src/config/db-config.json`.

### Documentation

if you want to modify only documentation, change comments in source code, generate documentation with the above command and commit changes on master branch with a commit message starting with:  
 `[DOC] Your message here`.

 Documentation code is generated using [apidoc](https://github.com/apidoc/apidoc), it is currently hosted on github pages and can be found at :

 **https://gramatiik.github.io/brew-api/**


## Licence

MIT _(see **[LICENCE.md](LICENCE.md)**)_
