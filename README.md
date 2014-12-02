ufinder
=======

[![NPM version](https://badge.fury.io/js/ufinder.png)](http://badge.fury.io/js/ufinder)
[![Dependency Status](https://david-dm.org/jetiny/ufinder.png)](https://david-dm.org/jetiny/ufinder)
[![devDependency Status](https://david-dm.org/jetiny/ufinder/dev-status.png)](https://david-dm.org/jetiny/ufinder#info=devDependencies)

> Recursive finder for files &amp; directories with asynchronously supported and user defined filters

## Command Line

### Install
```sh
$ npm install -g ufinder
```

### Usage
```sh
$ ufind -h
```

```
  Usage: ufind [options]
  Options:
    -h, --help           output usage information
    -V, --version        output the version number
    -p, --path [path]    Input search directory
    -r, --recursive      Recursive
    -o, --output [file]  Output file
    -j, --json           Output JSON format
    -s, --skipFile       Skip file
    -i, --includeFile    File include filter
    -e, --excludeFile    File exclude filter
    -S, --skipDir        Skip directory
    -I, --includeDir     Directory exclude filter
    -E, --excludeFile    Directory exclude filter
```

## Library

### Install
```sh
$ npm install --save ufinder
```

### Usage

#### options
```javascript
var Finder = require('ufinder')
    ;
var finder = new Finder({
    recursive:true,        //recursive folders
    skipFile:false,        //skip record file
    skipDir:true,          //skip record directory
    includeFile:'*.js',    //file include filter
    excludeFile:'u*',      //file exclude filter
    includeDir:'*',        //directory include filter
    excludeDir:'node_*'    //directory exclude filter
});
```
#### async
```javascript
finder.find('', function(err, datas){
    if (err) {
        console.error(err);
    } else {
        console.log(datas);
    }
})
```
#### sync
```javascript
try {
    var r = finder.findSync('');
    console.log(r);
}catch(err){
    console.error(err);
}
```

## License
Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE file.