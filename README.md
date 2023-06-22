# s1-23-id608001-project-2-node-js-express-pub-quiz-app-CalebStephens

This is a RESTful backend application written in Javascript with express and node, prisma orm and render for the server.
Quiz related data is being pulled from the opentdb enpoints.

## Initial Set-Up

1. Clone down the repo.
2. You must have Node installed on your computer.
3. Open a terminal, navigate to the root directory of the project.
4. Run the command `npm i` or `npm install`.
5. You need to create an env with a `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_LIFETIME`.

## Scripts Available:

Using `npm run`

- `dev`: starts local deployment using nodemon.
- `lint`: runs a linting check over your code.
- `prettier`: formats your code to match rules set up in `.prettierrc.json`.
- `test`: runs any tests that may be set up.
- `studio`: runs prisma studio.
- `migration`: runs a database migration.
- `commit`: runs commitizen.
- `seed:create`: creates Super Admin users.
