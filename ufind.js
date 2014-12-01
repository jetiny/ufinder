var fs = require('fs')
  , Finder = require('./finder')
  , program = require('commander')
  , pkg = JSON.parse(fs.readFileSync(__dirname+'/package.json', 'utf-8'))
  ;
program
    .version(pkg.version)
    .option('-p, --path [path]', 'Input search directory')
    .option('-r, --recursive', 'Recursive')
    .option('-o, --output [file]', 'Output file')
    .option('-j, --json', 'Output JSON format')
    
    .option('-s, --skipFile', 'Skip file')
    .option('-i, --includeFile', 'File include filter')
    .option('-e, --excludeFile', 'File exclude filter')
    
    .option('-S, --skipDir', 'Skip directory')
    .option('-I, --includeDir', 'Directory exclude filter')
    .option('-E, --excludeFile', 'Directory exclude filter')
    .parse(process.argv)
    ;

(!program.path || (program.path === true)) && (program.path = '');

var buffered = program.json || program.output;

if (!buffered) {
    program.process = function(r, strPath, dir, file, stat){
        console.log(r);
    }
}

function exitIfError(err){
    if (err) {
        console.error('!Error:');
        console.error();
        console.error(err);
        process.exit(1);
    }
}

var finder = new Finder(program);
finder.find(program.path, function(err, datas){
    exitIfError(err);
    if (buffered) {
        var odata = program.json 
            ? JSON.stringify(datas, 4, 4) 
            : datas.join(/*process.platform == 'win32' ? '\r\n' : */'\n') ;
        if (program.output) {
            fs.writeFile(program.output, odata, function(err){
                exitIfError(err);
            })
        } else {
            console.log(odata) ;
        }
    }
})
