import { extractExportsFromFile } from './src/listFunctions'

extractExportsFromFile('./src/functions/index.ts').then(console.log)