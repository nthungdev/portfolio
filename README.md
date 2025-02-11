# Portfolio

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploy with Firebase Hosting

- Make sure you have .npmrc file with the following content:

```bash
legacy-peer-deps=true
```

This is needed because not all dependecies are using React 19.

- Create an .env.<firebase_project_id> file with the environment variables for the project. Required variables are in the [.env.example](./.env.example) file.

Run

```bash
firebase deploy --only hosting
```
