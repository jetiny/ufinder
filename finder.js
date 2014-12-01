var fs = require('fs'),
    path = require('path'),
    CallBack = require('async-callback'),
    minimatch = require('minimatch')
    ;

function Finder(opts) {
    this.opts = opts || {};
    this.__registerFilter();
}

function parseAsRegexp(val){
    if (val instanceof RegExp){
        return val;
    } else if (val instanceof Array) {
        return new RegExp(val[0], val[1]);
    } else if (val instanceof Object) {
        return new RegExp(val.pattern, val.flags);
    } else {
        var flags = val.lastIndexOf('/');
        if (val.length && flags > 0) {
            return new RegExp(val.substr(1, flags-1), val.substr(flags+1, val.length));
        }
    }
}

function getRegExp(opts, name){
    if (opts[name]){
        var re = parseAsRegexp(opts[name]);
        return function(dist){
            return re ? re.exec(dist) : minimatch(dist, opts[name]);
        }
    }
}

function getSize(val){
    if (val instanceof String) {
        var aval = val.replace('gt:','>').replace('lt:','<').split(',');
        if (aval.length == 2){
            //@TODO size string type parse
        }
    }
    if (val instanceof Array && val.length == 2){
        if (val[0] == '>') {
            return function(size){
                return size > val[1];
            }
        } else if (val[0] == '<'){
            return function(size){
                return size < val[1];
            }
        } else {
            return function(size){
                return size > val[0] && size < val[1];
            }
        }
    }
}

var _fileFilters = {
    "excludeFile":function(opts){
        var re = getRegExp(opts,"excludeFile");
        return re && function(name, stat, isFile, isDir){
            return !isFile || !re(name);
        }
    },
    "includeFile": function(opts){
        var re = getRegExp(opts,"includeFile");
        return re && function(name, stat, isFile, isDir){
            return !isFile || re(name);
        }
    },
    "fileSize":function(opts){
        var compare;
        if (opts.fileSize && (compare=getSize(opts.fileSize)) ){
            return function(name, stat, isFile, isDir){
                return !isFile || compare(stat.size);
            }
        }
    }
}

var _dirFilters = {
    "excludeDir":function(opts){
        var re = getRegExp(opts,"excludeDir");
        return re && function(name, stat, isFile, isDir){
            return isFile || !re(name);
        }
    },
    "includeDir": function(opts){
        var re = getRegExp(opts,"includeDir");
        return re && function(name, stat, isFile, isDir){
            return isFile || re(name);
        }
    }
}

Finder.format = function(path, dir, name, stat){
    return path;
}

Finder.prototype.__registerFilter = function(){
    var filter;
    this._fileFilters = [];
    for(var x in _fileFilters) {
        if (filter = _fileFilters[x](this.opts)){
            this._fileFilters.push(filter);
        }
    }
    this._dirFilters = [];
    for(var x in _dirFilters) {
        if (filter = _dirFilters[x](this.opts)){
            this._dirFilters.push(filter);
        }
    }
}

Finder.prototype.__filter = function(strPath, dir, file, stat, cb, arys){
    //get
    var that   = this;
    var opts   = this.opts;
    var isFile = stat.isFile();
    var isDir  = stat.isDirectory();

    //file
    if (isFile) {
        //skip
        if (opts.skipFile)
            return cb && cb.dec();
        //filters
        for(var i= 0, l = that._fileFilters.length; i<l; i++){
            if (!that._fileFilters[i](file, stat, isFile, isDir)){
                return cb && cb.dec();
            }
        }
    } else if (isDir) {
        //skip
        if (opts.skipDir && !opts.recursive)
            return cb && cb.dec();
        //filters
        for(var i= 0, l = that._dirFilters.length; i<l; i++){
            if (!that._dirFilters[i](file, stat, isFile, isDir)){
                return cb && cb.dec();
            }
        }
    } else { // ? isBlockDevice | isCharacterDevice | isSymbolicLink | isFIFO | isSocket
        return cb && cb.dec();
    }

    //recursive
    if (isDir && opts.recursive) {
        if (cb) {
            that.find(strPath, cb);
        } else {
            that.filterSync(strPath, fs.readdirSync(strPath), arys);
        }
    }

    //format
    var format = (opts.skipDir && isDir) ? false : (opts.format || Finder.format)(strPath, dir, file, stat);
    if (format) {
        opts.process && opts.process(format, strPath, dir, file, stat);
        if (cb) {
            cb.accept(format);
        } else {
            arys.push(format);
        }
    } else {
        cb && cb.dec();
    }
}

Finder.prototype.filter = function(dir, files, cb){
    var that = this;
    cb.each(files,function(file){
        var strPath  = path.join(dir, file);
        fs.lstat(strPath, cb.once(function(stat) {
            that.__filter(strPath, dir, file, stat, cb)
        }))
    })
}

Finder.prototype.filterSync = function(dir, files, arys){
    var that = this;
    files.forEach(function(file){
        strPath = path.join(dir, file);
        stat = fs.lstatSync(strPath);
        that.__filter(strPath, dir, file, stat, null, arys)
    })
}

Finder.prototype.find = function(dir, cb) {
    cb = CallBack(cb);
    var that = this;
    cb.inc();
    fs.readdir(dir, cb.once(function(files){
        if (files.length) {
            that.filter(dir, files, cb);
        }
        cb.dec();
    }))
}

Finder.prototype.findSync = function(dir){
    var arys = [];
    this.filterSync(dir, fs.readdirSync(dir), arys);
    return arys;
}

module.exports = Finder;
