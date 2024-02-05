import ts from 'typescript';
import fs from 'fs/promises'

interface TypeObject {
  name: string;
  body: {};
  fileUrl: string
}

export function extractExportsFromFile(fileName: string) {
  const sourceFile = ts.createSourceFile(
    fileName,
    ts.sys.readFile(fileName)!,
    ts.ScriptTarget.ES2015,
    true
  );

  const sourceFileNodes: ts.Node[] = []
  const wholeProjectTypes: TypeObject[] = [];

 async function exec(){
    ts.forEachChild(sourceFile, (node) => {
      sourceFileNodes.push(node);
    });
    await Promise.all(sourceFileNodes.map(nodeIterationCallback))
    console.log(wholeProjectTypes);
  }

  async function nodeIterationCallback(node: ts.Node) {
    if (!node.getText()) return;

    if(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)){
      const importFilePath = node.getText().split('from')[1].replaceAll('"', '').replace(';', '');
      const concatPath = `${fileName.split('/').slice(0, fileName.split('/').length - 1).join('/').trim()}/${importFilePath.trim()}`
      wholeProjectTypes.push(...(await getAllInterfacesOnFile(concatPath)))
    }
  }
  exec();
}


//UTILS
async function getAllInterfacesOnFile (filePath: string, fileExtension = 'ts'): Promise<TypeObject[]> {
  const parsedFilePathWithFileExtension = `${filePath}.${fileExtension}`.replaceAll('/./', '/');
  const wholeFile = await fs.readFile(parsedFilePathWithFileExtension, {encoding: 'utf8'})
  return Array.from(
    wholeFile.matchAll(/(export\s)*interface\s*[A-Z+]\w*\s*{.*\s[\s\w\d:;]*}/g))
    .map(elem => {
      const splittedAndParsedInterface = elem[0].replace(/(export[\s]*)*(interface )/g, '').split('{', )
      splittedAndParsedInterface[1] = splittedAndParsedInterface[1].replaceAll(/[\n\r\s]*/g, '').replaceAll(';', ',').trim();
      splittedAndParsedInterface[1] = splittedAndParsedInterface[1].split(',').map(
        interfaceBody => interfaceBody.split(':').map(entryString => `"${entryString}"`).join(':')
        ).join(',').replace(',"}"', ' }');
      return {
        name: splittedAndParsedInterface[0].trim() as string,
        body: JSON.parse(`{ ${splittedAndParsedInterface[1]}`) as {},
        fileUrl: parsedFilePathWithFileExtension
      }
    });
  
}