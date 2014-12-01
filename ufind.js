var fs = require('fs')
  , Finder = require('./finder')
  , program = require('commander')
  , pkg = JSON.parse(fs.readFileSync(__dirname+'/package.json', 'utf-8'))
  ;
program
	.version(pkg.version)
	.option('-p, --path [path]', 'Search directory path')
	.option('-r, --recursive', 'Recursive')
    .option('-o, --output [file]', 'Output file')
    
    .option('-sf, --skipFile[boolean]', 'Skip file')
    .option('-sd, --skipDir', 'Skip directory')
    
    .option('-if, --includeFile', 'File include filter')
    .option('-ef, --excludeFile', 'File exclude filter')
    
    .option('-id, --includeDir', 'Directory exclude filter')
    .option('-ed, --excludeFile', 'Directory exclude filter')
    
	.parse(process.argv)
	;

if (!program.path) {
	program.help();
} else {
    (program.path || program.path === true) && (program.path = '');
    if (!program.output) {
        program.process = function(r, strPath, dir, file, stat){
            console.log(r);
        }
    }
    var finder = new Finder(program);
    finder.find(program.path, function(err, datas){
        if (err) {
            console.log(err);
        } else if (program.output) {
            console.log(datas);
        }
    })
    
}
