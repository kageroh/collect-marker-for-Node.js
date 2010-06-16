sys = require('sys'),
obj = require('./list').obj;
(function() {
	var ret = ['path'];
	for (var prop in obj) {
		ret.push(prop);
	}
	sys.puts(ret.join('\t'));
})();
