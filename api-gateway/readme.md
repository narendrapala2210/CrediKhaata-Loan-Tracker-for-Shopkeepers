<!--  -->

npm init

npm install -D typescript @types/node @types/express ts-node

npm i express

npx tsc --init

{
"compilerOptions": {
"target": "ES6",
"module": "commonjs",
"strict": true,
"esModuleInterop": true,
"outDir": "./dist"
},
"include": ["src/**/*"],
"exclude": ["node_modules"]
}

"scripts": {
"build": "tsc",
"start": "node dist/index.js",
"dev": "nodemon --exec ts-node src/index.ts",
"test": "echo \"Error: no test specified\" && exit 1"
}
