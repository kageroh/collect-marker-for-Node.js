fs  = require('fs'),
sys = require('sys'),
Gin = require('./gin').Gin;
(function() {
	var path     = process.argv[2];
	var encoding = process.argv[3];

	var delimiter = '\t';

	var Pre = Gin.Parser.RegExp;
	Gin.OPEN       = new Pre(/[\(（<＜\[［\{｛≪〈《【〔「『]/);
	Gin.CLOSE      = new Pre(/[\)）>＞\]］\}｝≫〉》】〕」』]/);
	Gin.DOT        = new Pre(/[.．:：]/);
	Gin.KANJI_KANA = new Pre(/[\u3041-\u30FF\u4E00-\u9FA5]/);
	Gin.STRING     = new Pre(/[\x09\x20-\uD7FF\uE000-\uFFFD]+/);
	Gin.CHAR       = new Pre(/[\x09\x20-\uD7FF\uE000-\uFFFD]/);
	Gin.S          = new Pre(/[\x09\x20\u3000]/);

	var gin = new Gin.Grammar({
	  Marker    : / ( Marker0 | Marker1 | Marker2 ):marker ($STRING?):string /,
	  Marker0   : / $OPEN Types $CLOSE /,
	  Marker1   : / Types ( $CLOSE | $DOT ) ::unshift /,
	  Marker2   : / Symbols $KANJI_KANA:kanjikana ::unshift /,
	  Types     : / Type Type? ::join /,
	  Type      : / $CHAR - ( $DOT | $OPEN | $CLOSE ) /,
	  Symbols   : / Symbol Symbol? $S? ::join /,
	  Symbol    : / $CHAR - ( $DOT | $OPEN | $CLOSE | $KANJI_KANA ) /
	}, 'Marker', Gin.SPACE);

	var act = function() {
		var that = {};
		var _s = '';
		that.marker    = function(v) { return v.join(delimiter); };
		that.kanjikana = function(v) { _s = v; return ''; };
		that.string    = function(v) { return _s + v.join(''); };
		that.unshift   = function(v) { v.unshift(''); return v; };
		that.join      = function(v) { return v.join(''); };
		return that;
	};

	var trim = (function() {
		var re = /^[\x09\x20\u3000]+|[\x09\x20\u3000]+$/g;
		return function(str) {
			return str.replace(re, '');
		};
	})();

	fs.readFile(path, encoding, function(err, data) {
		if (err) throw err;

		var ret = [];
		var str = data.toString();

		var lines = str.split(/\n|\r\n?/);
		for (var i = lines.length; i--;) {
			var line = trim(lines[i]);
			if (line.length === 0) {
				continue;
			}
			var match = gin.parse(line, act());
			if (!match || !match.full) {
				continue;
			}
			var values = match.value;
			values.unshift(path);
			ret.push(values.join(delimiter));
		}

		sys.puts(ret.join('\n'));
	});
})();
