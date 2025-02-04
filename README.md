![Header](./nerdy-ned-banner.webp)
# NEDStack template

- nunjucks
- express
- That's it, okay?

This is a template for an [Express](http://expressjs.com/) app using [nunjucks](https://mozilla.github.io/nunjucks/) as the templating engine. There is no frontend javascript. Add it as you need it. As is, it does plenty without any need for it.

It requires Node.js v18 or later.

## Other features

- CSS only theme switcher
- live reload
- CSS largely based on [milligram](https://milligram.io/)
- biome for linting and formatting
- [feather icons](https://feathericons.com/)

## Quirks

Tooling for datastar is not great. The javascript is in a string so the normal javascript lsp ignores it. I've heard there is a vscode extension now?

## Getting started

Since it's a template, you'll need to make a copy of it. I recommend using [degit](https://github.com/Rich-Harris/degit) to do this.

```bash
npx degit lunchboxer/nedstack-template my-project
cd my-project
```

You'll need to have [atlas](https://atlasgo.io) installed for the database migrations. `curl -sSf https://atlasgo.sh | sh` should do the trick. With atlas installed run `./database/migrate-local.sh` to create the local sqlite database and set it up according to `./database/schema.sql`.

Install dependencies with `npm install`.

Create a `.env` file with the following contents:

```env
JWT_SECRET=changeme
TURSO_DB_URL=
TURSO_AUTH_TOKEN=
DB_URL_DEV=file:./database/dev.sqlite
```

Create the first admin user with `npm run seed`
Run the server with `npm run dev`.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## **License**

NEDStack template is released under the MIT License. See the **[LICENSE](./LICENSE)** file for details.
