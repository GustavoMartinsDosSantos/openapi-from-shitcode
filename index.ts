import ts from 'typescript'
import { extractExportsFromFile } from './src/listFunctions'

extractExportsFromFile('./src/functions/index.ts');