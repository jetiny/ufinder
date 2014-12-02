var fs = require('fs')
  , Finder = require('./finder')
  , program = require('commander')
  , pkg = JSON.parse(fs.readFileSync(__dirname+'/package.json', 'utf-8'))
  ;
program
    .version(pkg.version)
    .option('-p, --path [path]', 'input search directory')
    .option('-r, --recursive', 'recursive')
    .option('-o, --output [file]', 'output file')
    .option('-j, --json', 'output JSON format')
    
    .option('-s, --skipFile', 'skip file')
    .option('-i, --includeFile', 'file include filter')
    .option('-e, --excludeFile', 'file exclude filter')
    
    .option('-S, --skipDir', 'skip directory')
    .option('-I, --includeDir', 'directory exclude filter')
    .option('-E, --excludeFile', 'directory exclude filter')
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
