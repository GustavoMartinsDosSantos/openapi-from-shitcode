import ts from 'typescript';
import fs from 'fs/promises'

interface TypeObject {
  name: string;
  body: {};
  fileUrl: string
}

var wholeProjectTypes: TypeObject[] = [];

export async function extractExportsFromFile(fileName: string, modulesExtension = 'ts') {
  console.log(`extractExportsFromFile(concatPath)`, fileName)
  
 const sourceFileNodes: ts.Node[] = []
 async function exec(){
  const sourceFile = ts.createSourceFile(
    fileName,
    ts.sys.readFile(fileName)!,
    ts.ScriptTarget.ES2015,
    true
  );

    ts.forEachChild(sourceFile, (node) => {
      sourceFileNodes.push(node);
    });

    await Promise.all(sourceFileNodes.map(nodeIterationCallback))
  }

  async function nodeIterationCallback(node: ts.Node) {
    if (!node.getText()) return;

    if(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)){
      const importFilePath = node.getText().split('from')[1].replaceAll('"', '').replace(';', '');
      const concatPath = `${fileName.split('/').slice(0, fileName.split('/').length - 1).join('/').trim()}/${importFilePath.trim()}.${modulesExtension}`
      extractExportsFromFile(concatPath)
      wholeProjectTypes.push(...(await getAllInterfacesOnFile(concatPath)))
    }
  }
  await exec();

  return parseAntInjectExtendedTypes(wholeProjectTypes);
}


//UTILS
async function getAllInterfacesOnFile (filePath: string): Promise<TypeObject[]> {
  const parsedFilePathWithFileExtension = `${filePath}`.replaceAll('/./', '/');
  const wholeFile = await fs.readFile(parsedFilePathWithFileExtension, {encoding: 'utf8'})
  const typesWithoutExtends = Array.from(
    wholeFile.matchAll(/(export\s)*interface\s*[A-Z+]\w*\s*{.*\s[\s\w\d:;]*}/g))
    .map(elem => parseMatchedRegexIntoObject(parsedFilePathWithFileExtension, elem));
  const typesWithExtends = Array.from(
    wholeFile.matchAll(/(export\s)*interface\s*[A-Za-z+]\w*\s*extends\s*[A-Za-z+]\w*\s*{.*\s[\s\w\d:;]*}/g))
    .map(elem => parseMatchedRegexIntoObject(parsedFilePathWithFileExtension, elem));
  return [...typesWithExtends, ...typesWithoutExtends]
}

function parseMatchedRegexIntoObject (filePath: string, regexMatch: RegExpMatchArray) {
  const splittedAndParsedInterface = regexMatch[0].replace(/(export[\s]*)*(interface )/g, '').split('{', )
 
    splittedAndParsedInterface[1] = splittedAndParsedInterface[1].replaceAll(/[\n\r\s]*/g, '').replaceAll(';', ',').trim();
    splittedAndParsedInterface[1] = splittedAndParsedInterface[1].split(',').map(
      (interfaceBody: string) => interfaceBody.split(':').map((entryString: string) => `"${entryString}"`).join(':')
      ).join(',').replace(',"}"', ' }');
      return {
        name: splittedAndParsedInterface[0].trim() as string,
        body: JSON.parse(`{ ${splittedAndParsedInterface[1]}`) as {},
        fileUrl: filePath
      }
}

function parseAntInjectExtendedTypes(typesList: TypeObject[]){
  const typesWithExtends = typesList.filter(type => type.name.match(/\s*extends\s*[A-Za-z+]\w*\s*/g))
  typesWithExtends.forEach(type => {
    const [typeName, extendedTypeName] = type.name.split('extends')
    const extendedType = typesList.find(type => type.name === extendedTypeName.trim())
    type.name = typeName.trim()
    type.body = {...type.body, ...extendedType?.body}
  })
  // fullTypeWithExtendName = fullTypeWithExtendName.replace(/\s*extends\s*[A-Za-z+]\w*\s*/g, '').trim();
  return typesList;
}