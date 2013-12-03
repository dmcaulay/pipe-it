//
// inspired by node.js stream
//
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Stream = module.exports = function() {
  EventEmitter.call(this);

  function onError(err) {
    if (this.listeners('error').length === 1) throw err;
  }
  this.on('error', onError);
};
util.inherits(Stream, EventEmitter);

Stream.prototype.pipe = function(dest) {
  var source = this;

  function onData(data) {
    dest.write(data);
  }
  source.on('data', onData);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var SimpleStream = function(func) {
  Stream.call(this)
  this.func = func
  this.argCount = this.func.length
  if (this.argCount < 1 || this.argCount > 3) throw new Error("Creating SimpleStream with invalid arg count:" + this.argCount)
}
util.inherits(SimpleStream, Stream)

SimpleStream.prototype.write = function(data) {
  var func
  if (this.argCount === 1) {
    func = this.func.bind(this)
  } else if (this.argCount === 2) {
    func = this.func.bind(this, data)
  } else {
    func = this.func.bind(this, data, meta)
  }
  func(function(err, new_data) {
    if (err) return this.emit('error', err)
    this.emit('data', new_data)
  }.bind(this))
}

var toStream = function(fn) {
  return new SimpleStream(func)
}

var pipe = function(fns) {
  var current
  var streams = fns.map(function(fn) {
    var stream = toStream(fn).on('error', callback)
    if (current) current.pipe(stream)
    return current = stream
  })
  return streams[0]
}

module.exports = {
  Stream: SimpleStream,
  SimpleStream: SimpleStream,
  toStream: toStream,
  pipe: pipe
}

