# Rang

An online 4 player card game

## Tooling

| Module | Framework |
| --- | --- |
| Backend| Socket.IO |
| Frontend | React |

## Running Development Environment

Clone the repository to your local machine:

```bash
git clone https://github.com/eimaansaqib/Rang
```

Install nodemon for typscript files:
```bash
npm install -g ts-node
npm install --save-dev ts-node nodemon
```

Install dependencies:

```bash
cd Rang/MyGame && npm install
cd ./frontend && npm install
```

Start the server:

```bash
cd ../backend && nodemon server.ts
```

Start the client:

```bash
cd ../frontend && npm start
```
