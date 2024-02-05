import ts from 'typescript';
import fs from 'fs/promises'

export function extractExportsFromFile(fileName: string) {
  // Lê o arquivo
  const sourceFile = ts.createSourceFile(
    fileName,
    ts.sys.readFile(fileName)!,
    ts.ScriptTarget.ES2015,
    true
  );

  ts.forEachChild(sourceFile, nodeIterationCallback);

  async function nodeIterationCallback(node: ts.Node) {
    console.log(node?.getText(), ts.isExportDeclaration(node));
    // if (!node.getText()) return;

    // if(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)){
    //   const importFilePath = node.getText().split('from')[1].replaceAll('"', '').replace(';', '');
    //   const concatPath = `${fileName.split('/').slice(0, fileName.split('/').length - 1).join('/').trim()}/${importFilePath.trim()}`
    //   wholeProjectInterfaces.push(...(await getAllInterfacesOnFile(concatPath)))
    // }
    nodeIterationCallback(node.getChildAt(2))
  }
}


//UTILS
async function getAllInterfacesOnFile (filePath: string, fileExtension = 'ts'): Promise<{name: string, body: {}}[]> {
  const wholeFile = await fs.readFile(`${filePath}.${fileExtension}`, {encoding: 'utf8'})
  return Array.from(
    wholeFile.matchAll(/(export\s)*interface\s*[A-Z+]\w*\s*{.*\s[\s\w\d:;]*}/g))
    .map(elem => {
      const splittedAndParsedInterface = elem[0].replace('export interface ', '').split('{', )
      splittedAndParsedInterface[1] = splittedAndParsedInterface[1].replaceAll(/[\n\r\s]*/g, '').replaceAll(';', ',').trim();
      splittedAndParsedInterface[1] = splittedAndParsedInterface[1].split(',').map(
        interfaceBody => interfaceBody.split(':').map(entryString => `"${entryString}"`).join(':')
        ).join(',').replace(',"}"', ' }');
      return {
        name: splittedAndParsedInterface[0].trim() as string,
        body: JSON.parse(`{ ${splittedAndParsedInterface[1]}`) as {}
      }
    });
  
}