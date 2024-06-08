# tibetan-chatbot-interface
Tibetan Chatbot interface

#Tibeta Chatbot interface Node.js Project

This is a simple Node.js project using TypeScript, containerized with Docker.

## Prerequisites

- Node.js (>=14.x)
- npm (comes with Node.js)
- Docker

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/KharagEdition/tibetan-chatbot-interface
cd tibetan-chatbot-interface




my-typescript-nodejs-project/
│
├── src/
│   └── index.ts
│
├── dist/
│   └── index.js
│
├── node_modules/
│
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── tsconfig.json


Creating new project ?
## Getting Started

1. **Create a New Project Directory**

    ```sh
    mkdir my-typescript-nodejs-project
    cd my-typescript-nodejs-project
    ```

2. **Initialize a New Node.js Project**

    ```sh
    npm init -y
    ```

3. **Install TypeScript and Other Dependencies**

    ```sh
    npm install typescript ts-node @types/node @types/express --save-dev
    npm install express
    ```

4. **Initialize TypeScript Configuration**

    ```sh
    npx tsc --init
    ```

5. **Create Source Directory and Entry File**

    ```sh
    mkdir src
    touch src/index.ts
    ```

6. **Edit `src/index.ts` to Include a Basic Express Server Setup**

    ```typescript
    import express from 'express';

    const app = express();
    const port = 3000;

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
    ```

7. **Update `tsconfig.json`**

    Ensure your `tsconfig.json` includes the following configuration to specify the output directory and the module resolution strategy:

    ```json
    {
      "compilerOptions": {
        "target": "ES6",
        "module": "commonjs",
        "rootDir": "./src",
        "outDir": "./dist",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      },
      "include": ["src"],
      "exclude": ["node_modules"]
    }
    ```

8. **Add Scripts to `package.json`**

    Add the following scripts to your `package.json` file to build and start your application:

    ```json
    {
      "name": "my-typescript-nodejs-project",
      "version": "1.0.0",
      "description": "",
      "main": "dist/index.js",
      "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "ts-node src/index.ts"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "express": "^4.17.1"
      },
      "devDependencies": {
        "@types/express": "^4.17.11",
        "@types/node": "^14.14.37",
        "ts-node": "^9.1.1",
        "typescript": "^4.2.3"
      }
    }
    ```

9. **Build and Run Your Project**

    - Build your project using the TypeScript compiler:

      ```sh
      npm run build
      ```

    - Run your project using Node.js:

      ```sh
      npm start
      ```

    - For development, you can use `ts-node` to directly run TypeScript files without needing to build them first:

      ```sh
      npm run dev
      ```
