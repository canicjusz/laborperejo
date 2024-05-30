# Laborperejo

_Laborperejo_ (eng: employment agency) - a fully fledged employment website built with SvelteKit, Express.js and Prisma ORM. It was created as a centralized job searching platform for esperantists.

The project incorporates search engines, login system with password changing feature, advanced personal and company profile editor, job offer and company panels, reminder emails the day before the followed job postings expire.

![Hero](./screenshots/hero.png)

## Development

### Structure

The project is divided into two folders `front-end` - client side code, `back-end` - server side code. Each of these directories must contain an `.env` file, all the required variables are listed in `front-end/.env.example` and `back-end/.env.example`.

### Setup

Run the `npm run install` script in the root directory. Once the environment variables are provided and packages are installed you can use the following scripts in the root directory:

- `npm run install-all` - installs npm packages in both mentioned directories
- `npm run build` - bundles and compiles the client side of the app
- `npm run prisma` - creates all the necessary tables in the database and populates them with dummy data
- `npm run start` - starts the back-end server (don't run it before `npm run build-front`)

Preferably run scripts in this order.

### Use

There are two test users provided.

| **Name** |      **Email**      | **Password** |
| :------: | :-----------------: | :----------: |
| John Doe | johndoe@example.com |   password   |
| Jane Doe | janedoe@example.com |  password1   |

Since the registration won't work (unless you provide SMTP credentials for e-mail delivery), you can use these two users to login and play around.

I advise you to use Google Translator addon, it creates bugs and its translations are incredibly inaccurate but it is better than nothing.
