var fs = require('fs');
var through = require('through');
var rands = require('rand-stream');
var split = require('binary-split');

var meta = {
  'fortunes': { offsets: [] },
  'literature': { offsets: [] },
  'riddles': { offsets: [] }
};
var types = Object.keys(meta);

function scan(type, done) {
  var offset = 0;
  var offsets = [];

  function write(ln) {
    offset += ln.length + 1; // line + newline
    if (ln.length === 1) offsets.push(offset);
  }

  // read the entire file
  // make note of the fortune offsets
  fs.createReadStream('./fortunes/'+ type)
    .pipe(split())
    .pipe(through(write))
    .on('end', function() { done(null, offsets); });
}

// read a random fortune
function read(type, done) {
  var offsets = meta[type].offsets;
  var index = Math.floor(Math.random() * offsets.length);
  var len = (offsets[index + 1] - 3) - offsets[index];
  var buf = new Buffer(len);

  fs.open('./fortunes/'+ type, 'r', function(err, fd) {
    fs.read(fd, buf, 0, len, offsets[index], function (err, bytes, buf) {
      done(err, buf.toString());
    });
  });
}

function fortune(options, done) {
  if (typeof done === 'undefined') {
    done = options;
    options = {};
  }

  var type = types[Math.floor(Math.random() * 3)];
  if (! meta[type].offsets.length) {
    scan(type, function (err, offsets) {
      meta[type].offsets = offsets;
      read(type, done);
    });
  } else {
    // select a random offset in the file
    read(type, done);
  }
}

module.exports = fortune;
