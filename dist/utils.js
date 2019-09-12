"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showUsage = showUsage;
exports.run = run;
exports.versionToNumber = versionToNumber;
exports.forceRmDir = forceRmDir;
exports.ensureCleanDirectory = ensureCleanDirectory;
exports.argsToOptions = argsToOptions;
exports.bindPathJoinTo = bindPathJoinTo;
exports.inputLine = inputLine;
exports.breakWords = breakWords;
exports.rootPath = exports.version = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/*
 * Copyright 2018-2019 TON DEV SOLUTIONS LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.  You may obtain a copy of the
 * License at: https://www.ton.dev/licenses
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 *
 */
var fs = require('fs');

var path = require('path');

var _require = require('child_process'),
    spawn = _require.spawn;

var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString()).version;
exports.version = version;
var root = process.cwd();

function showUsage(usage) {
  console.log("TON Labs Dev Tools ".concat(version));
  console.log(usage);
}

var spawnEnv = _objectSpread({}, process.env);

function run(name) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return new Promise(function (resolve, reject) {
    try {
      var spawned = spawn(name, args, {
        env: spawnEnv
      });
      var errors = [];
      var output = [];
      spawned.stdout.on('data', function (data) {
        output.push(data.toString());
      });
      spawned.stderr.on('data', function (data) {
        errors.push(data.toString());
      });
      spawned.on('error', function (err) {
        reject(err);
      });
      spawned.on('close', function (code) {
        if (code === 0) {
          resolve(output.join(''));
        } else {
          reject(errors.join(''));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function versionToNumber(s) {
  var parts = "".concat(s || '').split('.').map(function (x) {
    return Number.parseInt(x);
  }).slice(0, 3);

  while (parts.length < 3) {
    parts.push(0);
  }

  return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
}

function forceRmDir(dir) {
  fs.readdirSync(dir).forEach(function (item) {
    var itemPath = path.join(dir, item);
    var stat = fs.statSync(itemPath);

    if (itemPath === "." || itemPath === "..") {} else if (stat.isDirectory()) {
      forceRmDir(itemPath);
    } else {
      fs.unlinkSync(itemPath);
    }
  });
  fs.rmdirSync(dir);
}

function ensureCleanDirectory(path) {
  if (fs.existsSync(path)) {
    forceRmDir(path);
  }

  fs.mkdirSync(path, {
    recursive: true
  });
}

function findOptionName(arg, types) {
  if (arg.startsWith('--')) {
    var name = arg.substr(2);
    var optionName = Object.keys(types).find(function (x) {
      return x.toLowerCase() === name.toLowerCase();
    });

    if (!optionName) {
      throw "Invalid option: ".concat(arg);
    }

    return optionName;
  }

  if (arg.startsWith('-')) {
    var _name = arg.substr(1);

    var optionEntry = Object.entries(types).find(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          _ = _ref2[0],
          _type = _ref2[1];

      var type = _type;
      return "".concat(type["short"] || '').toLowerCase() === _name.toLowerCase();
    });

    if (!optionEntry) {
      throw "Invalid option: ".concat(arg);
    }

    return optionEntry[0];
  }

  return null;
}

function argsToOptions(args, types) {
  var options = {
    files: []
  };
  Object.entries(types).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        name = _ref4[0],
        _type = _ref4[1];

    var type = _type;

    if ((type.valueCount || 0) > 1) {
      options[name] = [];
    } else {
      options[name] = type.def;
    }
  });
  var pendingOption = null;
  args.forEach(function (arg) {
    if (pendingOption) {
      var type = types[pendingOption];

      if ((type.valueCount || 0) > 1) {
        options[pendingOption].push(arg);
      } else {
        options[pendingOption] = arg;
      }

      pendingOption = null;
    } else {
      var optionName = findOptionName(arg, types);

      if (optionName) {
        var _type2 = types[optionName];

        if ((_type2.valueCount || 0) > 0) {
          pendingOption = optionName;
        } else {
          options[optionName] = true;
        }
      } else {
        options.files.push(arg);
      }
    }
  });
  return options;
}

function bindPathJoinTo(base, separator) {
  if (separator) {
    var join = function join(base, item) {
      var baseWithSep = base.endsWith(separator);
      var itemWithSep = item.startsWith(separator);

      if (baseWithSep && itemWithSep) {
        return "".concat(base).concat(item.substr(1));
      }

      if (!baseWithSep && !itemWithSep) {
        return "".concat(base, "/").concat(item);
      }

      return "".concat(base).concat(item);
    };

    return function () {
      var path = base;

      for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }

      items.forEach(function (x) {
        return path = join(path, x);
      });
      return path;
    };
  }

  return function () {
    for (var _len3 = arguments.length, items = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      items[_key3] = arguments[_key3];
    }

    return items.length > 0 ? path.join.apply(path, [base].concat(items)) : base;
  };
}

var rootPath = bindPathJoinTo(root);
exports.rootPath = rootPath;

function inputLine() {
  return new Promise(function (resolve) {
    var standard_input = process.stdin;
    standard_input.setEncoding('utf-8');
    standard_input.once('data', function (data) {
      resolve("".concat(data).trim());
    });
  });
}

function breakWords(s) {
  var words = s.split(' ');
  var result = '';
  var line = '';
  words.forEach(function (w) {
    if (line.length + w.length > 80) {
      if (result !== '') {
        result += '\n';
      }

      result += line;
      line = '';
    }

    if (line !== '') {
      line += ' ';
    }

    line += w;
  });

  if (line !== '') {
    if (result !== '') {
      result += '\n';
    }

    result += line;
  }

  return result;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwYXRoIiwic3Bhd24iLCJ2ZXJzaW9uIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiam9pbiIsIl9fZGlybmFtZSIsInRvU3RyaW5nIiwicm9vdCIsInByb2Nlc3MiLCJjd2QiLCJzaG93VXNhZ2UiLCJ1c2FnZSIsImNvbnNvbGUiLCJsb2ciLCJzcGF3bkVudiIsImVudiIsInJ1biIsIm5hbWUiLCJhcmdzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzcGF3bmVkIiwiZXJyb3JzIiwib3V0cHV0Iiwic3Rkb3V0Iiwib24iLCJkYXRhIiwicHVzaCIsInN0ZGVyciIsImVyciIsImNvZGUiLCJlcnJvciIsInZlcnNpb25Ub051bWJlciIsInMiLCJwYXJ0cyIsInNwbGl0IiwibWFwIiwieCIsIk51bWJlciIsInBhcnNlSW50Iiwic2xpY2UiLCJsZW5ndGgiLCJmb3JjZVJtRGlyIiwiZGlyIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwiaXRlbSIsIml0ZW1QYXRoIiwic3RhdCIsInN0YXRTeW5jIiwiaXNEaXJlY3RvcnkiLCJ1bmxpbmtTeW5jIiwicm1kaXJTeW5jIiwiZW5zdXJlQ2xlYW5EaXJlY3RvcnkiLCJleGlzdHNTeW5jIiwibWtkaXJTeW5jIiwicmVjdXJzaXZlIiwiZmluZE9wdGlvbk5hbWUiLCJhcmciLCJ0eXBlcyIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJvcHRpb25OYW1lIiwiT2JqZWN0Iiwia2V5cyIsImZpbmQiLCJ0b0xvd2VyQ2FzZSIsIm9wdGlvbkVudHJ5IiwiZW50cmllcyIsIl8iLCJfdHlwZSIsInR5cGUiLCJhcmdzVG9PcHRpb25zIiwib3B0aW9ucyIsImZpbGVzIiwidmFsdWVDb3VudCIsImRlZiIsInBlbmRpbmdPcHRpb24iLCJiaW5kUGF0aEpvaW5UbyIsImJhc2UiLCJzZXBhcmF0b3IiLCJiYXNlV2l0aFNlcCIsImVuZHNXaXRoIiwiaXRlbVdpdGhTZXAiLCJpdGVtcyIsInJvb3RQYXRoIiwiaW5wdXRMaW5lIiwic3RhbmRhcmRfaW5wdXQiLCJzdGRpbiIsInNldEVuY29kaW5nIiwib25jZSIsInRyaW0iLCJicmVha1dvcmRzIiwid29yZHMiLCJyZXN1bHQiLCJsaW5lIiwidyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNQSxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLElBQU1DLElBQUksR0FBR0QsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O2VBQ2tCQSxPQUFPLENBQUMsZUFBRCxDO0lBQWpCRSxLLFlBQUFBLEs7O0FBRVIsSUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLEtBQUwsQ0FBV04sRUFBRSxDQUFDTyxZQUFILENBQWdCTCxJQUFJLENBQUNNLElBQUwsQ0FBVUMsU0FBVixFQUFxQixpQkFBckIsQ0FBaEIsRUFBeURDLFFBQXpELEVBQVgsRUFBZ0ZOLE9BQWhHOztBQUNBLElBQU1PLElBQUksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLEVBQWI7O0FBRUEsU0FBU0MsU0FBVCxDQUFtQkMsS0FBbkIsRUFBa0M7QUFDOUJDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUiw4QkFBa0NiLE9BQWxDO0FBQ0FZLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixLQUFaO0FBQ0g7O0FBRUQsSUFBTUcsUUFBUSxxQkFDUE4sT0FBTyxDQUFDTyxHQURELENBQWQ7O0FBSUEsU0FBU0MsR0FBVCxDQUFhQyxJQUFiLEVBQStEO0FBQUEsb0NBQWpDQyxJQUFpQztBQUFqQ0EsSUFBQUEsSUFBaUM7QUFBQTs7QUFDM0QsU0FBTyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3BDLFFBQUk7QUFDQSxVQUFNQyxPQUFPLEdBQUd2QixLQUFLLENBQUNrQixJQUFELEVBQU9DLElBQVAsRUFBYTtBQUFFSCxRQUFBQSxHQUFH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QUFYO0FBQ0FGLEVBQUFBLEtBQUssQ0FBQ2hELE9BQU4sQ0FBYyxVQUFDbUQsQ0FBRCxFQUFPO0FBQ2pCLFFBQUlELElBQUksQ0FBQ3RELE1BQUwsR0FBY3VELENBQUMsQ0FBQ3ZELE1BQWhCLEdBQXlCLEVBQTdCLEVBQWlDO0FBQzdCLFVBQUlxRCxNQUFNLEtBQUssRUFBZixFQUFtQjtBQUNmQSxRQUFBQSxNQUFNLElBQUksSUFBVjtBQUNIOztBQUNEQSxNQUFBQSxNQUFNLElBQUlDLElBQVY7QUFDQUEsTUFBQUEsSUFBSSxHQUFHLEVBQVA7QUFDSDs7QUFDRCxRQUFJQSxJQUFJLEtBQUssRUFBYixFQUFpQjtBQUNiQSxNQUFBQSxJQUFJLElBQUksR0FBUjtBQUNIOztBQUNEQSxJQUFBQSxJQUFJLElBQUlDLENBQVI7QUFDSCxHQVpEOztBQWFBLE1BQUlELElBQUksS0FBSyxFQUFiLEVBQWlCO0FBQ2IsUUFBSUQsTUFBTSxLQUFLLEVBQWYsRUFBbUI7QUFDZkEsTUFBQUEsTUFBTSxJQUFJLElBQVY7QUFDSDs7QUFDREEsSUFBQUEsTUFBTSxJQUFJQyxJQUFWO0FBQ0g7O0FBQ0QsU0FBT0QsTUFBUDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDE4LTIwMTkgVE9OIERFViBTT0xVVElPTlMgTFRELlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBTT0ZUV0FSRSBFVkFMVUFUSU9OIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxuICogdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXG4gKiBMaWNlbnNlIGF0OiBodHRwczovL3d3dy50b24uZGV2L2xpY2Vuc2VzXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBUT04gREVWIHNvZnR3YXJlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuLy8gQGZsb3dcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7IHNwYXduIH0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5cbmNvbnN0IHZlcnNpb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJykpLnRvU3RyaW5nKCkpLnZlcnNpb247XG5jb25zdCByb290ID0gcHJvY2Vzcy5jd2QoKTtcblxuZnVuY3Rpb24gc2hvd1VzYWdlKHVzYWdlOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhgVE9OIExhYnMgRGV2IFRvb2xzICR7dmVyc2lvbn1gKTtcbiAgICBjb25zb2xlLmxvZyh1c2FnZSk7XG59XG5cbmNvbnN0IHNwYXduRW52ID0ge1xuICAgIC4uLnByb2Nlc3MuZW52LFxufTtcblxuZnVuY3Rpb24gcnVuKG5hbWU6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzcGF3bmVkID0gc3Bhd24obmFtZSwgYXJncywgeyBlbnY6IHNwYXduRW52IH0pO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBbXTtcblxuICAgICAgICAgICAgc3Bhd25lZC5zdGRvdXQub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKGRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3Bhd25lZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3Bhd25lZC5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3Bhd25lZC5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3V0cHV0LmpvaW4oJycpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3JzLmpvaW4oJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdmVyc2lvblRvTnVtYmVyKHM6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgcGFydHMgPSBgJHtzIHx8ICcnfWAuc3BsaXQoJy4nKS5tYXAoeCA9PiBOdW1iZXIucGFyc2VJbnQoeCkpLnNsaWNlKDAsIDMpO1xuICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHBhcnRzLnB1c2goMCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJ0c1swXSAqIDEwMDAwMDAgKyBwYXJ0c1sxXSAqIDEwMDAgKyBwYXJ0c1syXTtcbn1cblxuZnVuY3Rpb24gZm9yY2VSbURpcihkaXI6IHN0cmluZykge1xuICAgIGZzLnJlYWRkaXJTeW5jKGRpcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBpdGVtUGF0aCA9IHBhdGguam9pbihkaXIsIGl0ZW0pO1xuICAgICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoaXRlbVBhdGgpO1xuXG4gICAgICAgIGlmIChpdGVtUGF0aCA9PT0gXCIuXCIgfHwgaXRlbVBhdGggPT09IFwiLi5cIikge1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgZm9yY2VSbURpcihpdGVtUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGl0ZW1QYXRoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGZzLnJtZGlyU3luYyhkaXIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVDbGVhbkRpcmVjdG9yeShwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoKSkge1xuICAgICAgICBmb3JjZVJtRGlyKHBhdGgpO1xuICAgIH1cbiAgICBmcy5ta2RpclN5bmMocGF0aCwgKHsgcmVjdXJzaXZlOiB0cnVlIH06IGFueSkpO1xufVxuXG5cbmV4cG9ydCB0eXBlIEFyZ1R5cGUgPSB7XG4gICAgZGVmOiBhbnksXG4gICAgc2hvcnQ/OiBzdHJpbmcsXG4gICAgdmFsdWVDb3VudD86IG51bWJlcixcbn1cblxuZXhwb3J0IHR5cGUgQXJnVHlwZXMgPSB7XG4gICAgW3N0cmluZ106IEFyZ1R5cGVcbn1cblxuZnVuY3Rpb24gZmluZE9wdGlvbk5hbWUoYXJnOiBzdHJpbmcsIHR5cGVzOiBBcmdUeXBlcykge1xuICAgIGlmIChhcmcuc3RhcnRzV2l0aCgnLS0nKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gYXJnLnN1YnN0cigyKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uTmFtZSA9IE9iamVjdC5rZXlzKHR5cGVzKS5maW5kKHggPT4geC50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBpZiAoIW9wdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRocm93IGBJbnZhbGlkIG9wdGlvbjogJHthcmd9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9uTmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZy5zdGFydHNXaXRoKCctJykpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGFyZy5zdWJzdHIoMSk7XG4gICAgICAgIGNvbnN0IG9wdGlvbkVudHJ5ID0gT2JqZWN0LmVudHJpZXModHlwZXMpLmZpbmQoKFtfLCBfdHlwZV0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGU6IEFyZ1R5cGUgPSAoX3R5cGU6IGFueSk7XG4gICAgICAgICAgICByZXR1cm4gYCR7dHlwZS5zaG9ydCB8fCAnJ31gLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghb3B0aW9uRW50cnkpIHtcbiAgICAgICAgICAgIHRocm93IGBJbnZhbGlkIG9wdGlvbjogJHthcmd9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9uRW50cnlbMF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5cbmZ1bmN0aW9uIGFyZ3NUb09wdGlvbnMoYXJnczogc3RyaW5nW10sIHR5cGVzOiB7IFtzdHJpbmddOiBBcmdUeXBlIH0pOiBhbnkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGZpbGVzOiBbXSxcbiAgICB9O1xuICAgIE9iamVjdC5lbnRyaWVzKHR5cGVzKS5mb3JFYWNoKChbbmFtZSwgX3R5cGVdKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGU6IEFyZ1R5cGUgPSAoX3R5cGU6IGFueSk7XG4gICAgICAgIGlmICgodHlwZS52YWx1ZUNvdW50IHx8IDApID4gMSkge1xuICAgICAgICAgICAgb3B0aW9uc1tuYW1lXSA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9uc1tuYW1lXSA9IHR5cGUuZGVmO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgbGV0IHBlbmRpbmdPcHRpb24gPSBudWxsO1xuICAgIGFyZ3MuZm9yRWFjaCgoYXJnKSA9PiB7XG4gICAgICAgIGlmIChwZW5kaW5nT3B0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gdHlwZXNbcGVuZGluZ09wdGlvbl07XG4gICAgICAgICAgICBpZiAoKHR5cGUudmFsdWVDb3VudCB8fCAwKSA+IDEpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zW3BlbmRpbmdPcHRpb25dLnB1c2goYXJnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uc1twZW5kaW5nT3B0aW9uXSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlbmRpbmdPcHRpb24gPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uTmFtZSA9IGZpbmRPcHRpb25OYW1lKGFyZywgdHlwZXMpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gdHlwZXNbb3B0aW9uTmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKCh0eXBlLnZhbHVlQ291bnQgfHwgMCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdPcHRpb24gPSBvcHRpb25OYW1lO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbb3B0aW9uTmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5maWxlcy5wdXNoKGFyZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuZXhwb3J0IHR5cGUgUGF0aEpvaW4gPSAoLi4uaXRlbXM6IHN0cmluZ1tdKSA9PiBzdHJpbmc7XG5cbmZ1bmN0aW9uIGJpbmRQYXRoSm9pblRvKGJhc2U6IHN0cmluZywgc2VwYXJhdG9yPzogc3RyaW5nKTogUGF0aEpvaW4ge1xuICAgIGlmIChzZXBhcmF0b3IpIHtcbiAgICAgICAgZnVuY3Rpb24gam9pbihiYXNlOiBzdHJpbmcsIGl0ZW06IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgICAgICBjb25zdCBiYXNlV2l0aFNlcCA9IGJhc2UuZW5kc1dpdGgoc2VwYXJhdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1XaXRoU2VwID0gaXRlbS5zdGFydHNXaXRoKHNlcGFyYXRvcik7XG4gICAgICAgICAgICBpZiAoYmFzZVdpdGhTZXAgJiYgaXRlbVdpdGhTZXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZX0ke2l0ZW0uc3Vic3RyKDEpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWJhc2VXaXRoU2VwICYmICFpdGVtV2l0aFNlcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlfS8ke2l0ZW19YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlfSR7aXRlbX1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoLi4uaXRlbXM6IHN0cmluZ1tdKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGxldCBwYXRoID0gYmFzZTtcbiAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goeCA9PiBwYXRoID0gam9pbihwYXRoLCB4KSk7XG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKC4uLml0ZW1zOiBzdHJpbmdbXSk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtcy5sZW5ndGggPiAwID8gcGF0aC5qb2luKGJhc2UsIC4uLml0ZW1zKSA6IGJhc2U7XG4gICAgfVxufVxuXG5jb25zdCByb290UGF0aCA9IGJpbmRQYXRoSm9pblRvKHJvb3QpO1xuXG5cbmZ1bmN0aW9uIGlucHV0TGluZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGFuZGFyZF9pbnB1dCA9IHByb2Nlc3Muc3RkaW47XG4gICAgICAgIHN0YW5kYXJkX2lucHV0LnNldEVuY29kaW5nKCd1dGYtOCcpO1xuICAgICAgICBzdGFuZGFyZF9pbnB1dC5vbmNlKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJlc29sdmUoYCR7ZGF0YX1gLnRyaW0oKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBicmVha1dvcmRzKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgd29yZHMgPSBzLnNwbGl0KCcgJyk7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGxldCBsaW5lID0gJyc7XG4gICAgd29yZHMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICBpZiAobGluZS5sZW5ndGggKyB3Lmxlbmd0aCA+IDgwKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCArPSBsaW5lO1xuICAgICAgICAgICAgbGluZSA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lICE9PSAnJykge1xuICAgICAgICAgICAgbGluZSArPSAnICc7XG4gICAgICAgIH1cbiAgICAgICAgbGluZSArPSB3O1xuICAgIH0pO1xuICAgIGlmIChsaW5lICE9PSAnJykge1xuICAgICAgICBpZiAocmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBsaW5lO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuZXhwb3J0IHtcbiAgICB2ZXJzaW9uLFxuICAgIHNob3dVc2FnZSxcbiAgICBydW4sXG4gICAgdmVyc2lvblRvTnVtYmVyLFxuICAgIGZvcmNlUm1EaXIsXG4gICAgZW5zdXJlQ2xlYW5EaXJlY3RvcnksXG4gICAgYXJnc1RvT3B0aW9ucyxcbiAgICBiaW5kUGF0aEpvaW5UbyxcbiAgICByb290UGF0aCxcbiAgICBpbnB1dExpbmUsXG4gICAgYnJlYWtXb3Jkcyxcbn1cbiJdfQ==