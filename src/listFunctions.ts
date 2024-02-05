import ts from 'typescript';

export function extractExportsFromFile(fileName: string) {
  // Lê o arquivo
  const sourceFile = ts.createSourceFile(
    fileName,
    ts.sys.readFile(fileName)!,
    ts.ScriptTarget.ES2015,
    true
  );

  ts.forEachChild(sourceFile, visit);
  // Função para extrair e imprimir as exportações
  function visit(node: ts.Node) {
    if(!node.getText()) return;
    
    // const evaluated = eval(ts.transpile(node.getText()))
    console.log(node.getText())
  }
}

// Substitua 'path/to/your/file.ts' pelo caminho do seu arquivo TypeScript