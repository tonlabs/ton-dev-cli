"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevDocker = exports.ContainerStatus = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _dockerode = _interopRequireDefault(require("dockerode"));

var _utils = require("./utils");

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
var ContainerStatus = {
  missing: 0,
  created: 1,
  running: 2
};
exports.ContainerStatus = ContainerStatus;

var DevDocker =
/*#__PURE__*/
function () {
  function DevDocker() {
    (0, _classCallCheck2["default"])(this, DevDocker);
    (0, _defineProperty2["default"])(this, "client", void 0);
    (0, _defineProperty2["default"])(this, "_images", void 0);
    (0, _defineProperty2["default"])(this, "_containers", void 0);
    (0, _defineProperty2["default"])(this, "_onStartupImagesPassed", void 0);
    (0, _defineProperty2["default"])(this, "onStartupImages", void 0);
    (0, _defineProperty2["default"])(this, "onBeforePull", void 0);
    this.client = new _dockerode["default"]();
    this.onStartupImages = null;
    this.onBeforePull = null;
    this._onStartupImagesPassed = false;
    this._images = null;
    this._containers = null;
  }

  (0, _createClass2["default"])(DevDocker, [{
    key: "dropCache",
    value: function dropCache() {
      this._images = null;
      this._containers = null;
    }
  }, {
    key: "getImageInfos",
    value: function () {
      var _getImageInfos = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var _images;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._images) {
                  _context.next = 7;
                  break;
                }

                _context.next = 3;
                return this.client.listImages({
                  all: true
                });

              case 3:
                _images = _context.sent;
                this._images = _images;

                if (!this._onStartupImagesPassed) {
                  this._onStartupImagesPassed = true;

                  if (this.onStartupImages) {
                    this.onStartupImages(_images);
                  }
                }

                this._images = _images;

              case 7:
                return _context.abrupt("return", this._images || []);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getImageInfos() {
        return _getImageInfos.apply(this, arguments);
      }

      return getImageInfos;
    }()
  }, {
    key: "getContainerInfos",
    value: function () {
      var _getContainerInfos = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this._containers) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 3;
                return this.client.listContainers({
                  all: true
                });

              case 3:
                this._containers = _context2.sent;

              case 4:
                return _context2.abrupt("return", this._containers || []);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getContainerInfos() {
        return _getContainerInfos.apply(this, arguments);
      }

      return getContainerInfos;
    }()
  }, {
    key: "numericVersion",
    value: function () {
      var _numericVersion = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var version;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.client.version();

              case 2:
                version = _context3.sent;
                return _context3.abrupt("return", (0, _utils.versionToNumber)(version.Version));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function numericVersion() {
        return _numericVersion.apply(this, arguments);
      }

      return numericVersion;
    }()
  }, {
    key: "removeImages",
    value: function () {
      var _removeImages = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(nameMatches) {
        var containerInfos, i, info, container, imageInfos, _i, _info, image;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getContainerInfos();

              case 2:
                _context4.t0 = function (info) {
                  return nameMatches.find(function (match) {
                    return DevDocker.containersImageMatched(info, match);
                  });
                };

                containerInfos = _context4.sent.filter(_context4.t0);
                i = 0;

              case 5:
                if (!(i < containerInfos.length)) {
                  _context4.next = 18;
                  break;
                }

                info = containerInfos[i];
                (0, _utils.progress)("Removing container [".concat(DevDocker.containerTitle(info), "]"));
                container = this.client.getContainer(info.Id);

                if (!DevDocker.isRunning(info)) {
                  _context4.next = 12;
                  break;
                }

                _context4.next = 12;
                return container.stop();

              case 12:
                _context4.next = 14;
                return container.remove();

              case 14:
                (0, _utils.progressDone)();

              case 15:
                i += 1;
                _context4.next = 5;
                break;

              case 18:
                _context4.next = 20;
                return this.getImageInfos();

              case 20:
                _context4.t1 = function (info) {
                  return nameMatches.find(function (match) {
                    return DevDocker.imageHasMatchedName(info, match);
                  });
                };

                imageInfos = _context4.sent.filter(_context4.t1);
                _i = 0;

              case 23:
                if (!(_i < imageInfos.length)) {
                  _context4.next = 33;
                  break;
                }

                _info = imageInfos[_i];
                (0, _utils.progress)("Removing image [".concat(DevDocker.imageTitle(_info), "]"));
                image = this.client.getImage(_info.Id);
                _context4.next = 29;
                return image.remove();

              case 29:
                (0, _utils.progressDone)();

              case 30:
                _i += 1;
                _context4.next = 23;
                break;

              case 33:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function removeImages(_x) {
        return _removeImages.apply(this, arguments);
      }

      return removeImages;
    }()
  }, {
    key: "pull",
    value: function () {
      var _pull = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5(repoTag) {
        var client, title, image;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.onBeforePull) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return this.onBeforePull(repoTag);

              case 3:
                client = this.client;
                title = "Pulling [".concat(repoTag, "]");
                (0, _utils.progress)(title);
                _context5.next = 8;
                return new Promise(function (resolve, reject) {
                  client.pull(repoTag, {}, function (err, stream) {
                    if (!stream) {
                      reject(err);
                      return;
                    }

                    var lastReportTime = Date.now();
                    client.modem.followProgress(stream, onFinished, onProgress);

                    function onFinished(err, output) {
                      resolve(output);
                    }

                    function onProgress(event) {
                      (0, _utils.progressLine)("".concat(title, "... ").concat(event.progress || ''));
                    }
                  });
                });

              case 8:
                image = _context5.sent;
                (0, _utils.progress)(title);
                (0, _utils.progressDone)();
                return _context5.abrupt("return", image);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function pull(_x2) {
        return _pull.apply(this, arguments);
      }

      return pull;
    }()
  }, {
    key: "findImageInfo",
    value: function () {
      var _findImageInfo = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee6(name) {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.getImageInfos();

              case 2:
                _context6.t1 = function (x) {
                  return DevDocker.imageHasMatchedName(x, name);
                };

                _context6.t0 = _context6.sent.find(_context6.t1);

                if (_context6.t0) {
                  _context6.next = 6;
                  break;
                }

                _context6.t0 = null;

              case 6:
                return _context6.abrupt("return", _context6.t0);

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function findImageInfo(_x3) {
        return _findImageInfo.apply(this, arguments);
      }

      return findImageInfo;
    }()
  }, {
    key: "findContainerInfo",
    value: function () {
      var _findContainerInfo = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7(name) {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.getContainerInfos();

              case 2:
                _context7.t1 = function (x) {
                  return DevDocker.hasName(x, name);
                };

                _context7.t0 = _context7.sent.find(_context7.t1);

                if (_context7.t0) {
                  _context7.next = 6;
                  break;
                }

                _context7.t0 = null;

              case 6:
                return _context7.abrupt("return", _context7.t0);

              case 7:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function findContainerInfo(_x4) {
        return _findContainerInfo.apply(this, arguments);
      }

      return findContainerInfo;
    }()
  }, {
    key: "shutdownContainer",
    value: function () {
      var _shutdownContainer = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee8(def, downTo) {
        var info;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.findContainerInfo(def.containerName);

              case 2:
                info = _context8.sent;

                if (info) {
                  _context8.next = 5;
                  break;
                }

                return _context8.abrupt("return");

              case 5:
                if (!(DevDocker.isRunning(info) && downTo < ContainerStatus.running)) {
                  _context8.next = 11;
                  break;
                }

                (0, _utils.progress)("Stopping [".concat(def.containerName, "]"));
                _context8.next = 9;
                return this.client.getContainer(info.Id).stop();

              case 9:
                (0, _utils.progressDone)();
                this.dropCache();

              case 11:
                if (!(downTo < ContainerStatus.created)) {
                  _context8.next = 17;
                  break;
                }

                (0, _utils.progress)("Removing [".concat(def.containerName, "]"));
                _context8.next = 15;
                return this.client.getContainer(info.Id).remove();

              case 15:
                (0, _utils.progressDone)();
                this.dropCache();

              case 17:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function shutdownContainer(_x5, _x6) {
        return _shutdownContainer.apply(this, arguments);
      }

      return shutdownContainer;
    }()
  }, {
    key: "ensureImage",
    value: function () {
      var _ensureImage = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee9(def) {
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.findImageInfo(def.requiredImage);

              case 2:
                if (_context9.sent) {
                  _context9.next = 6;
                  break;
                }

                _context9.next = 5;
                return this.pull(def.requiredImage);

              case 5:
                this.dropCache();

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function ensureImage(_x7) {
        return _ensureImage.apply(this, arguments);
      }

      return ensureImage;
    }()
  }, {
    key: "startupContainer",
    value: function () {
      var _startupContainer = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee10(def, upTo) {
        var info;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.ensureImage(def);

              case 2:
                _context10.next = 4;
                return this.findContainerInfo(def.containerName);

              case 4:
                info = _context10.sent;

                if (!(!info && upTo >= ContainerStatus.created)) {
                  _context10.next = 14;
                  break;
                }

                (0, _utils.progress)("Creating ".concat(def.containerName));
                _context10.next = 9;
                return def.createContainer(this);

              case 9:
                (0, _utils.progressDone)();
                this.dropCache();
                _context10.next = 13;
                return this.findContainerInfo(def.containerName);

              case 13:
                info = _context10.sent;

              case 14:
                if (!(info && !DevDocker.isRunning(info) && upTo >= ContainerStatus.running)) {
                  _context10.next = 20;
                  break;
                }

                (0, _utils.progress)("Starting ".concat(def.containerName));
                _context10.next = 18;
                return this.client.getContainer(info.Id).start();

              case 18:
                (0, _utils.progressDone)();
                this.dropCache();

              case 20:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function startupContainer(_x8, _x9) {
        return _startupContainer.apply(this, arguments);
      }

      return startupContainer;
    }()
  }, {
    key: "shutdownContainers",
    value: function () {
      var _shutdownContainers = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee11(defs, downTo) {
        var i;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < defs.length)) {
                  _context11.next = 7;
                  break;
                }

                _context11.next = 4;
                return this.shutdownContainer(defs[i], downTo);

              case 4:
                i += 1;
                _context11.next = 1;
                break;

              case 7:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function shutdownContainers(_x10, _x11) {
        return _shutdownContainers.apply(this, arguments);
      }

      return shutdownContainers;
    }()
  }, {
    key: "startupContainers",
    value: function () {
      var _startupContainers = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee12(defs, upTo) {
        var i;
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < defs.length)) {
                  _context12.next = 7;
                  break;
                }

                _context12.next = 4;
                return this.startupContainer(defs[i], upTo);

              case 4:
                i += 1;
                _context12.next = 1;
                break;

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function startupContainers(_x12, _x13) {
        return _startupContainers.apply(this, arguments);
      }

      return startupContainers;
    }()
  }, {
    key: "ensureRunning",
    value: function () {
      var _ensureRunning = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee13(def) {
        var info;
        return _regenerator["default"].wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.startupContainer(def, ContainerStatus.running);

              case 2:
                _context13.next = 4;
                return this.findContainerInfo(def.containerName);

              case 4:
                info = _context13.sent;
                return _context13.abrupt("return", this.client.getContainer(info && info.Id || def.containerName));

              case 6:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function ensureRunning(_x14) {
        return _ensureRunning.apply(this, arguments);
      }

      return ensureRunning;
    }()
  }], [{
    key: "hasName",
    value: function hasName(container, name) {
      var nameToFind = "/".concat(name).toLowerCase();
      return !!(container.Names || []).find(function (n) {
        return n.toLowerCase() === nameToFind;
      });
    }
  }, {
    key: "imageTitle",
    value: function imageTitle(info) {
      return DevDocker.imageNames(info)[0] || info.Id;
    }
  }, {
    key: "containerTitle",
    value: function containerTitle(info) {
      return info.Names.map(function (name) {
        return name.startsWith('/') ? name.substr(1) : name;
      }).join(';');
    } // if match specified with tag compare exactly
    // if match specified without tag compare untagged names

  }, {
    key: "imageNameMatched",
    value: function imageNameMatched(imageName, match) {
      imageName = imageName.toLowerCase();
      match = match.toLowerCase();
      var matchParts = match.split(':');

      if (matchParts.length > 1) {
        return imageName === match;
      }

      var imageParts = imageName.split(':');
      return imageParts[0] === matchParts[0];
    }
  }, {
    key: "imageNames",
    value: function imageNames(info) {
      return [].concat((0, _toConsumableArray2["default"])(info.RepoTags || []), (0, _toConsumableArray2["default"])((info.RepoDigests || []).map(function (digest) {
        return digest.split('@').join(':');
      })));
    }
  }, {
    key: "imageHasMatchedName",
    value: function imageHasMatchedName(info, match) {
      var _this = this;

      return !!DevDocker.imageNames(info).find(function (name) {
        return _this.imageNameMatched(name, match);
      });
    }
  }, {
    key: "isRunning",
    value: function isRunning(info) {
      return !!info && info.State.toLowerCase() === 'running';
    }
  }, {
    key: "containersImageMatched",
    value: function containersImageMatched(info, match) {
      return this.imageNameMatched(info.Image, match);
    }
  }]);
  return DevDocker;
}();

exports.DevDocker = DevDocker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kb2NrZXIuanMiXSwibmFtZXMiOlsiQ29udGFpbmVyU3RhdHVzIiwibWlzc2luZyIsImNyZWF0ZWQiLCJydW5uaW5nIiwiRGV2RG9ja2VyIiwiY2xpZW50IiwiRG9ja2VyIiwib25TdGFydHVwSW1hZ2VzIiwib25CZWZvcmVQdWxsIiwiX29uU3RhcnR1cEltYWdlc1Bhc3NlZCIsIl9pbWFnZXMiLCJfY29udGFpbmVycyIsImxpc3RJbWFnZXMiLCJhbGwiLCJpbWFnZXMiLCJsaXN0Q29udGFpbmVycyIsInZlcnNpb24iLCJWZXJzaW9uIiwibmFtZU1hdGNoZXMiLCJnZXRDb250YWluZXJJbmZvcyIsImluZm8iLCJmaW5kIiwibWF0Y2giLCJjb250YWluZXJzSW1hZ2VNYXRjaGVkIiwiY29udGFpbmVySW5mb3MiLCJmaWx0ZXIiLCJpIiwibGVuZ3RoIiwiY29udGFpbmVyVGl0bGUiLCJjb250YWluZXIiLCJnZXRDb250YWluZXIiLCJJZCIsImlzUnVubmluZyIsInN0b3AiLCJyZW1vdmUiLCJnZXRJbWFnZUluZm9zIiwiaW1hZ2VIYXNNYXRjaGVkTmFtZSIsImltYWdlSW5mb3MiLCJpbWFnZVRpdGxlIiwiaW1hZ2UiLCJnZXRJbWFnZSIsInJlcG9UYWciLCJ0aXRsZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicHVsbCIsImVyciIsInN0cmVhbSIsImxhc3RSZXBvcnRUaW1lIiwiRGF0ZSIsIm5vdyIsIm1vZGVtIiwiZm9sbG93UHJvZ3Jlc3MiLCJvbkZpbmlzaGVkIiwib25Qcm9ncmVzcyIsIm91dHB1dCIsImV2ZW50IiwicHJvZ3Jlc3MiLCJuYW1lIiwieCIsImhhc05hbWUiLCJkZWYiLCJkb3duVG8iLCJmaW5kQ29udGFpbmVySW5mbyIsImNvbnRhaW5lck5hbWUiLCJkcm9wQ2FjaGUiLCJmaW5kSW1hZ2VJbmZvIiwicmVxdWlyZWRJbWFnZSIsInVwVG8iLCJlbnN1cmVJbWFnZSIsImNyZWF0ZUNvbnRhaW5lciIsInN0YXJ0IiwiZGVmcyIsInNodXRkb3duQ29udGFpbmVyIiwic3RhcnR1cENvbnRhaW5lciIsIm5hbWVUb0ZpbmQiLCJ0b0xvd2VyQ2FzZSIsIk5hbWVzIiwibiIsImltYWdlTmFtZXMiLCJtYXAiLCJzdGFydHNXaXRoIiwic3Vic3RyIiwiam9pbiIsImltYWdlTmFtZSIsIm1hdGNoUGFydHMiLCJzcGxpdCIsImltYWdlUGFydHMiLCJSZXBvVGFncyIsIlJlcG9EaWdlc3RzIiwiZGlnZXN0IiwiaW1hZ2VOYW1lTWF0Y2hlZCIsIlN0YXRlIiwiSW1hZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWVBOztBQUVBOztBQWpCQTs7Ozs7Ozs7Ozs7Ozs7QUE0SE8sSUFBTUEsZUFBZSxHQUFHO0FBQzNCQyxFQUFBQSxPQUFPLEVBQUUsQ0FEa0I7QUFFM0JDLEVBQUFBLE9BQU8sRUFBRSxDQUZrQjtBQUczQkMsRUFBQUEsT0FBTyxFQUFFO0FBSGtCLENBQXhCOzs7SUFnQkRDLFM7OztBQVFGLHVCQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDVixTQUFLQyxNQUFMLEdBQWMsSUFBSUMscUJBQUosRUFBZDtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLElBQXBCO0FBQ0EsU0FBS0Msc0JBQUwsR0FBOEIsS0FBOUI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDSDs7OztnQ0FFVztBQUNSLFdBQUtELE9BQUwsR0FBZSxJQUFmO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQixJQUFuQjtBQUNIOzs7Ozs7Ozs7Ozs7O29CQUdRLEtBQUtELE87Ozs7Ozt1QkFDZSxLQUFLTCxNQUFMLENBQVlPLFVBQVosQ0FBdUI7QUFBQ0Msa0JBQUFBLEdBQUcsRUFBRTtBQUFOLGlCQUF2QixDOzs7QUFBZkMsZ0JBQUFBLE87QUFDTixxQkFBS0osT0FBTCxHQUFlSSxPQUFmOztBQUNBLG9C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VSxHQUFHSCxTQUFTLENBQUNFLEtBQVYsQ0FBZ0IsR0FBaEIsQ0FBbkI7QUFDQSxhQUFPQyxVQUFVLENBQUMsQ0FBRCxDQUFWLEtBQWtCRixVQUFVLENBQUMsQ0FBRCxDQUFuQztBQUNIOzs7K0JBRWlCbEUsSSxFQUE0QjtBQUMxQywyREFDUUEsSUFBSSxDQUFDcUUsUUFBTCxJQUFpQixFQUR6Qix1Q0FFTyxDQUFDckUsSUFBSSxDQUFDc0UsV0FBTCxJQUFvQixFQUFyQixFQUF5QlQsR0FBekIsQ0FBNkIsVUFBQ1UsTUFBRCxFQUFZO0FBQ3hDLGVBQU9BLE1BQU0sQ0FBQ0osS0FBUCxDQUFhLEdBQWIsRUFBa0JILElBQWxCLENBQXVCLEdBQXZCLENBQVA7QUFDSCxPQUZFLENBRlA7QUFNSDs7O3dDQUUwQmhFLEksRUFBa0JFLEssRUFBd0I7QUFBQTs7QUFDakUsYUFBTyxDQUFDLENBQUNsQixTQUFTLENBQUM0RSxVQUFWLENBQXFCNUQsSUFBckIsRUFBMkJDLElBQTNCLENBQWdDLFVBQUFzQyxJQUFJO0FBQUEsZUFBSSxLQUFJLENBQUNpQyxnQkFBTCxDQUFzQmpDLElBQXRCLEVBQTRCckMsS0FBNUIsQ0FBSjtBQUFBLE9BQXBDLENBQVQ7QUFDSDs7OzhCQUVnQkYsSSxFQUFnQztBQUM3QyxhQUFPLENBQUMsQ0FBQ0EsSUFBRixJQUFVQSxJQUFJLENBQUN5RSxLQUFMLENBQVdoQixXQUFYLE9BQTZCLFNBQTlDO0FBQ0g7OzsyQ0FFNkJ6RCxJLEVBQXNCRSxLLEVBQXdCO0FBQ3hFLGFBQU8sS0FBS3NFLGdCQUFMLENBQXNCeEUsSUFBSSxDQUFDMEUsS0FBM0IsRUFBa0N4RSxLQUFsQyxDQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMTgtMjAxOSBUT04gREVWIFNPTFVUSU9OUyBMVEQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIFNPRlRXQVJFIEVWQUxVQVRJT04gTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXG4gKiB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcbiAqIExpY2Vuc2UgYXQ6IGh0dHBzOi8vd3d3LnRvbi5kZXYvbGljZW5zZXNcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIFRPTiBERVYgc29mdHdhcmUgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG4vLyBAZmxvd1xuaW1wb3J0IERvY2tlciBmcm9tICdkb2NrZXJvZGUnO1xuXG5pbXBvcnQge3Byb2dyZXNzLCBwcm9ncmVzc0RvbmUsIHByb2dyZXNzTGluZSwgdmVyc2lvblRvTnVtYmVyfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgdHlwZSBESW1hZ2VJbmZvID0ge1xuICAgIElkOiBzdHJpbmcsXG4gICAgUmVwb1RhZ3M6IHN0cmluZ1tdLFxuICAgIFJlcG9EaWdlc3RzOiBzdHJpbmdbXSxcbn1cblxuZXhwb3J0IHR5cGUgRENvbnRhaW5lckluZm8gPSB7XG4gICAgSWQ6IHN0cmluZyxcbiAgICBOYW1lczogc3RyaW5nW10sXG4gICAgSW1hZ2U6IHN0cmluZyxcbiAgICBJbWFnZUlEOiBzdHJpbmcsXG4gICAgU3RhdGU6IHN0cmluZyxcbn1cblxuZXhwb3J0IHR5cGUgRENvbnRhaW5lckV4ZWNPcHRpb25zID0ge1xuICAgIEF0dGFjaFN0ZGluPzogYm9vbGVhbixcbiAgICBBdHRhY2hTdGRvdXQ/OiBib29sZWFuLFxuICAgIEF0dGFjaFN0ZGVycj86IGJvb2xlYW4sXG4gICAgRGV0YWNoS2V5cz86IHN0cmluZyxcbiAgICBUdHk/OiBib29sZWFuLFxuICAgIEVudj86IHN0cmluZyxcbiAgICBDbWQ/OiBzdHJpbmdbXSxcbiAgICBQcml2aWxlZ2VkPzogYm9vbGVhbixcbiAgICBVc2VyPzogc3RyaW5nLFxuICAgIFdvcmtpbmdEaXI/OiBzdHJpbmcsXG59XG5cbmV4cG9ydCB0eXBlIERvY2tlck1vZGVtID0ge1xuICAgIGZvbGxvd1Byb2dyZXNzKFxuICAgICAgICBzdHJlYW06IGFueSxcbiAgICAgICAgb25GaW5pc2hlZDogKGVycjogYW55LCBvdXRwdXQ6IGFueSkgPT4gdm9pZCxcbiAgICAgICAgb25Qcm9ncmVzczogKGV2ZW50OiBhbnkpID0+IHZvaWQsXG4gICAgKTogdm9pZCxcblxuICAgIGRlbXV4U3RyZWFtKFxuICAgICAgICBzdHJlYW06IGFueSxcbiAgICAgICAgc3Rkb3V0OiBhbnksXG4gICAgICAgIHN0ZGVycjogYW55LFxuICAgICk6IHZvaWQsXG59XG5cbmV4cG9ydCB0eXBlIERvY2tlckNvbnRhaW5lciA9IHtcbiAgICBpZDogc3RyaW5nLFxuICAgIG1vZGVtOiBEb2NrZXJNb2RlbSxcbiAgICBzdGFydCgpOiBQcm9taXNlPHZvaWQ+LFxuICAgIGV4ZWMob3B0aW9uczogRENvbnRhaW5lckV4ZWNPcHRpb25zLCBjYWxsYmFjazogYW55KTogdm9pZCxcbiAgICBzdG9wKCk6IFByb21pc2U8dm9pZD4sXG4gICAgcmVtb3ZlKCk6IFByb21pc2U8dm9pZD4sXG59XG5cbmV4cG9ydCB0eXBlIERvY2tlckltYWdlID0ge1xuICAgIHJlbW92ZSgpOiBQcm9taXNlPHZvaWQ+LFxufVxuXG5leHBvcnQgdHlwZSBETW91bnQgPSB7XG4gICAgVGFyZ2V0OiBzdHJpbmcsXG4gICAgU291cmNlOiBzdHJpbmcsXG4gICAgVHlwZTogJ2JpbmQnIHwgJ3ZvbHVtZScgfCAndG1wZnMnLFxufVxuXG5leHBvcnQgdHlwZSBEUG9ydEJpbmRpbmdzID0ge1xuICAgIFtzdHJpbmddOiB7IEhvc3RJcDogc3RyaW5nLCBIb3N0UG9ydDogc3RyaW5nIH1bXVxufTtcblxuZXhwb3J0IHR5cGUgRENyZWF0ZUNvbnRhaW5lck9wdGlvbnMgPSB7XG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBJbWFnZTogc3RyaW5nLFxuICAgIEludGVyYWN0aXZlPzogYm9vbGVhbixcbiAgICBUdHk/OiBib29sZWFuLFxuICAgIFVzZXI/OiBzdHJpbmcsXG4gICAgRW50cnlwb2ludD86IHN0cmluZ1tdLFxuICAgIEVudjogc3RyaW5nW10sXG4gICAgSG9zdENvbmZpZz86IHtcbiAgICAgICAgTW91bnRzPzogRE1vdW50W10sXG4gICAgfSxcbiAgICBFeHBvc2VkUG9ydHM/OiB7XG4gICAgICAgIFtzdHJpbmddOiB7fSxcbiAgICB9LFxuICAgIEhvc3RDb25maWc/OiB7XG4gICAgICAgIFBvcnRCaW5kaW5ncz86IERQb3J0QmluZGluZ3MsXG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBEVmVyc2lvbiA9IHtcbiAgICBWZXJzaW9uOiBzdHJpbmcsXG59XG5cbmV4cG9ydCB0eXBlIERvY2tlckNsaWVudCA9IHtcbiAgICB2ZXJzaW9uKCk6IFByb21pc2U8RFZlcnNpb24+LFxuXG4gICAgbGlzdENvbnRhaW5lcnMob3B0aW9ucz86IHsgYWxsPzogdHJ1ZSB9KTogUHJvbWlzZTxEQ29udGFpbmVySW5mb1tdPixcblxuICAgIGxpc3RJbWFnZXMob3B0aW9ucz86IHsgYWxsPzogdHJ1ZSB9KTogUHJvbWlzZTxESW1hZ2VJbmZvW10+LFxuXG4gICAgZ2V0Q29udGFpbmVyKGlkOiBzdHJpbmcpOiBEb2NrZXJDb250YWluZXIsXG5cbiAgICBnZXRJbWFnZShuYW1lOiBzdHJpbmcpOiBEb2NrZXJJbWFnZSxcblxuICAgIGNyZWF0ZUNvbnRhaW5lcihvcHRpb25zOiBEQ3JlYXRlQ29udGFpbmVyT3B0aW9ucyk6IFByb21pc2U8RG9ja2VyQ29udGFpbmVyPixcblxuICAgIHB1bGwocmVwb1RhZzogc3RyaW5nLCBhdXRoOiBhbnksIChlcnI6IGFueSwgc3RyZWFtOiBhbnkpID0+IHZvaWQpOiB2b2lkLFxuXG4gICAgbW9kZW06IERvY2tlck1vZGVtLFxufVxuXG5leHBvcnQgY29uc3QgQ29udGFpbmVyU3RhdHVzID0ge1xuICAgIG1pc3Npbmc6IDAsXG4gICAgY3JlYXRlZDogMSxcbiAgICBydW5uaW5nOiAyLFxufTtcblxuZXhwb3J0IHR5cGUgQ29udGFpbmVyU3RhdHVzVHlwZSA9IDAgfCAxIHwgMjtcblxuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXJEZWYge1xuICAgIHJlcXVpcmVkSW1hZ2U6IHN0cmluZyxcbiAgICBjb250YWluZXJOYW1lOiBzdHJpbmcsXG5cbiAgICBjcmVhdGVDb250YWluZXIoZG9ja2VyOiBEZXZEb2NrZXIpOiBQcm9taXNlPERvY2tlckNvbnRhaW5lcj5cbn1cblxuXG5jbGFzcyBEZXZEb2NrZXIge1xuICAgIGNsaWVudDogRG9ja2VyQ2xpZW50O1xuICAgIF9pbWFnZXM6ID8oREltYWdlSW5mb1tdKTtcbiAgICBfY29udGFpbmVyczogPyhEQ29udGFpbmVySW5mb1tdKTtcbiAgICBfb25TdGFydHVwSW1hZ2VzUGFzc2VkOiBib29sZWFuO1xuICAgIG9uU3RhcnR1cEltYWdlczogPygoaW1hZ2VzOiBESW1hZ2VJbmZvW10pID0+IHZvaWQpO1xuICAgIG9uQmVmb3JlUHVsbDogPygocmVwb1RhZzogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+KTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWVudCA9IG5ldyBEb2NrZXIoKTtcbiAgICAgICAgdGhpcy5vblN0YXJ0dXBJbWFnZXMgPSBudWxsO1xuICAgICAgICB0aGlzLm9uQmVmb3JlUHVsbCA9IG51bGw7XG4gICAgICAgIHRoaXMuX29uU3RhcnR1cEltYWdlc1Bhc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbWFnZXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9jb250YWluZXJzID0gbnVsbDtcbiAgICB9XG5cbiAgICBkcm9wQ2FjaGUoKSB7XG4gICAgICAgIHRoaXMuX2ltYWdlcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lcnMgPSBudWxsO1xuICAgIH1cblxuICAgIGFzeW5jIGdldEltYWdlSW5mb3MoKTogUHJvbWlzZTxESW1hZ2VJbmZvW10+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbWFnZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlcyA9IGF3YWl0IHRoaXMuY2xpZW50Lmxpc3RJbWFnZXMoe2FsbDogdHJ1ZX0pO1xuICAgICAgICAgICAgdGhpcy5faW1hZ2VzID0gaW1hZ2VzO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9vblN0YXJ0dXBJbWFnZXNQYXNzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblN0YXJ0dXBJbWFnZXNQYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uU3RhcnR1cEltYWdlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnR1cEltYWdlcyhpbWFnZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ltYWdlcyA9IGltYWdlcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faW1hZ2VzIHx8IFtdO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbnRhaW5lckluZm9zKCk6IFByb21pc2U8RENvbnRhaW5lckluZm9bXT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2NvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lcnMgPSBhd2FpdCB0aGlzLmNsaWVudC5saXN0Q29udGFpbmVycyh7YWxsOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lcnMgfHwgW107XG4gICAgfVxuXG4gICAgYXN5bmMgbnVtZXJpY1ZlcnNpb24oKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgY29uc3QgdmVyc2lvbjogRFZlcnNpb24gPSBhd2FpdCB0aGlzLmNsaWVudC52ZXJzaW9uKCk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uVG9OdW1iZXIodmVyc2lvbi5WZXJzaW9uKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW1vdmVJbWFnZXMobmFtZU1hdGNoZXM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIFN0b3AgYW5kIHJlbW92ZSBjb250YWluZXJzIHRoYXQgYmVsb25ncyB0byBpbWFnZXNcbiAgICAgICAgY29uc3QgY29udGFpbmVySW5mb3MgPSAoYXdhaXQgdGhpcy5nZXRDb250YWluZXJJbmZvcygpKS5maWx0ZXIoKGluZm8pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lTWF0Y2hlcy5maW5kKG1hdGNoID0+IERldkRvY2tlci5jb250YWluZXJzSW1hZ2VNYXRjaGVkKGluZm8sIG1hdGNoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRhaW5lckluZm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmZvID0gY29udGFpbmVySW5mb3NbaV07XG4gICAgICAgICAgICBwcm9ncmVzcyhgUmVtb3ZpbmcgY29udGFpbmVyIFske0RldkRvY2tlci5jb250YWluZXJUaXRsZShpbmZvKX1dYCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNsaWVudC5nZXRDb250YWluZXIoaW5mby5JZCk7XG4gICAgICAgICAgICBpZiAoRGV2RG9ja2VyLmlzUnVubmluZyhpbmZvKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRhaW5lci5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBjb250YWluZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcm9ncmVzc0RvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgaW1hZ2VzXG4gICAgICAgIGNvbnN0IGltYWdlSW5mb3MgPSAoYXdhaXQgdGhpcy5nZXRJbWFnZUluZm9zKCkpLmZpbHRlcigoaW5mbykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWVNYXRjaGVzLmZpbmQobWF0Y2ggPT4gRGV2RG9ja2VyLmltYWdlSGFzTWF0Y2hlZE5hbWUoaW5mbywgbWF0Y2gpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VJbmZvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGltYWdlSW5mb3NbaV07XG4gICAgICAgICAgICBwcm9ncmVzcyhgUmVtb3ZpbmcgaW1hZ2UgWyR7RGV2RG9ja2VyLmltYWdlVGl0bGUoaW5mbyl9XWApO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLmNsaWVudC5nZXRJbWFnZShpbmZvLklkKTtcbiAgICAgICAgICAgIGF3YWl0IGltYWdlLnJlbW92ZSgpO1xuICAgICAgICAgICAgcHJvZ3Jlc3NEb25lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBwdWxsKHJlcG9UYWc6IHN0cmluZyk6IFByb21pc2U8RG9ja2VySW1hZ2U+IHtcbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVQdWxsKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLm9uQmVmb3JlUHVsbChyZXBvVGFnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmNsaWVudDtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBgUHVsbGluZyBbJHtyZXBvVGFnfV1gO1xuICAgICAgICBwcm9ncmVzcyh0aXRsZSk7XG4gICAgICAgIGNvbnN0IGltYWdlID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2xpZW50LnB1bGwocmVwb1RhZywge30sIGZ1bmN0aW9uIChlcnIsIHN0cmVhbSkge1xuICAgICAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBsYXN0UmVwb3J0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgY2xpZW50Lm1vZGVtLmZvbGxvd1Byb2dyZXNzKHN0cmVhbSwgb25GaW5pc2hlZCwgb25Qcm9ncmVzcyk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkZpbmlzaGVkKGVyciwgb3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3V0cHV0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblByb2dyZXNzKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzTGluZShgJHt0aXRsZX0uLi4gJHtldmVudC5wcm9ncmVzcyB8fCAnJ31gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2dyZXNzKHRpdGxlKTtcbiAgICAgICAgcHJvZ3Jlc3NEb25lKCk7XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG5cbiAgICBhc3luYyBmaW5kSW1hZ2VJbmZvKG5hbWU6IHN0cmluZyk6IFByb21pc2U8P0RJbWFnZUluZm8+IHtcbiAgICAgICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldEltYWdlSW5mb3MoKSkuZmluZCh4ID0+IERldkRvY2tlci5pbWFnZUhhc01hdGNoZWROYW1lKHgsIG5hbWUpKSB8fCBudWxsO1xuICAgIH1cblxuICAgIGFzeW5jIGZpbmRDb250YWluZXJJbmZvKG5hbWU6IHN0cmluZyk6IFByb21pc2U8P0RDb250YWluZXJJbmZvPiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRDb250YWluZXJJbmZvcygpKS5maW5kKHggPT4gRGV2RG9ja2VyLmhhc05hbWUoeCwgbmFtZSkpIHx8IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgc2h1dGRvd25Db250YWluZXIoZGVmOiBDb250YWluZXJEZWYsIGRvd25UbzogQ29udGFpbmVyU3RhdHVzVHlwZSkge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgdGhpcy5maW5kQ29udGFpbmVySW5mbyhkZWYuY29udGFpbmVyTmFtZSk7XG4gICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChEZXZEb2NrZXIuaXNSdW5uaW5nKGluZm8pICYmIGRvd25UbyA8IENvbnRhaW5lclN0YXR1cy5ydW5uaW5nKSB7XG4gICAgICAgICAgICBwcm9ncmVzcyhgU3RvcHBpbmcgWyR7ZGVmLmNvbnRhaW5lck5hbWV9XWApO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQuZ2V0Q29udGFpbmVyKGluZm8uSWQpLnN0b3AoKTtcbiAgICAgICAgICAgIHByb2dyZXNzRG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5kcm9wQ2FjaGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG93blRvIDwgQ29udGFpbmVyU3RhdHVzLmNyZWF0ZWQpIHtcbiAgICAgICAgICAgIHByb2dyZXNzKGBSZW1vdmluZyBbJHtkZWYuY29udGFpbmVyTmFtZX1dYCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNsaWVudC5nZXRDb250YWluZXIoaW5mby5JZCkucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcm9ncmVzc0RvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJvcENhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBlbnN1cmVJbWFnZShkZWY6IENvbnRhaW5lckRlZikge1xuICAgICAgICBpZiAoIShhd2FpdCB0aGlzLmZpbmRJbWFnZUluZm8oZGVmLnJlcXVpcmVkSW1hZ2UpKSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wdWxsKGRlZi5yZXF1aXJlZEltYWdlKTtcbiAgICAgICAgICAgIHRoaXMuZHJvcENhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBzdGFydHVwQ29udGFpbmVyKGRlZjogQ29udGFpbmVyRGVmLCB1cFRvOiBDb250YWluZXJTdGF0dXNUeXBlKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZW5zdXJlSW1hZ2UoZGVmKTtcbiAgICAgICAgbGV0IGluZm86ID9EQ29udGFpbmVySW5mbyA9IGF3YWl0IHRoaXMuZmluZENvbnRhaW5lckluZm8oZGVmLmNvbnRhaW5lck5hbWUpO1xuICAgICAgICBpZiAoIWluZm8gJiYgdXBUbyA+PSBDb250YWluZXJTdGF0dXMuY3JlYXRlZCkge1xuICAgICAgICAgICAgcHJvZ3Jlc3MoYENyZWF0aW5nICR7ZGVmLmNvbnRhaW5lck5hbWV9YCk7XG4gICAgICAgICAgICBhd2FpdCBkZWYuY3JlYXRlQ29udGFpbmVyKHRoaXMpO1xuICAgICAgICAgICAgcHJvZ3Jlc3NEb25lKCk7XG4gICAgICAgICAgICB0aGlzLmRyb3BDYWNoZSgpO1xuICAgICAgICAgICAgaW5mbyA9IGF3YWl0IHRoaXMuZmluZENvbnRhaW5lckluZm8oZGVmLmNvbnRhaW5lck5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmZvICYmICFEZXZEb2NrZXIuaXNSdW5uaW5nKGluZm8pICYmIHVwVG8gPj0gQ29udGFpbmVyU3RhdHVzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHByb2dyZXNzKGBTdGFydGluZyAke2RlZi5jb250YWluZXJOYW1lfWApO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQuZ2V0Q29udGFpbmVyKGluZm8uSWQpLnN0YXJ0KCk7XG4gICAgICAgICAgICBwcm9ncmVzc0RvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJvcENhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBzaHV0ZG93bkNvbnRhaW5lcnMoZGVmczogJFJlYWRPbmx5QXJyYXk8Q29udGFpbmVyRGVmPiwgZG93blRvOiBDb250YWluZXJTdGF0dXNUeXBlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zaHV0ZG93bkNvbnRhaW5lcihkZWZzW2ldLCBkb3duVG8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc3RhcnR1cENvbnRhaW5lcnMoZGVmczogJFJlYWRPbmx5QXJyYXk8Q29udGFpbmVyRGVmPiwgdXBUbzogQ29udGFpbmVyU3RhdHVzVHlwZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhcnR1cENvbnRhaW5lcihkZWZzW2ldLCB1cFRvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGVuc3VyZVJ1bm5pbmcoZGVmOiBDb250YWluZXJEZWYpOiBQcm9taXNlPERvY2tlckNvbnRhaW5lcj4ge1xuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0dXBDb250YWluZXIoZGVmLCBDb250YWluZXJTdGF0dXMucnVubmluZyk7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCB0aGlzLmZpbmRDb250YWluZXJJbmZvKGRlZi5jb250YWluZXJOYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpZW50LmdldENvbnRhaW5lcigoaW5mbyAmJiBpbmZvLklkKSB8fCBkZWYuY29udGFpbmVyTmFtZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGhhc05hbWUoY29udGFpbmVyOiBEQ29udGFpbmVySW5mbywgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IG5hbWVUb0ZpbmQgPSBgLyR7bmFtZX1gLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAhIShjb250YWluZXIuTmFtZXMgfHwgW10pLmZpbmQobiA9PiBuLnRvTG93ZXJDYXNlKCkgPT09IG5hbWVUb0ZpbmQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbWFnZVRpdGxlKGluZm86IERJbWFnZUluZm8pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gRGV2RG9ja2VyLmltYWdlTmFtZXMoaW5mbylbMF0gfHwgaW5mby5JZDtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29udGFpbmVyVGl0bGUoaW5mbzogRENvbnRhaW5lckluZm8pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gaW5mby5OYW1lcy5tYXAobmFtZSA9PiBuYW1lLnN0YXJ0c1dpdGgoJy8nKSA/IG5hbWUuc3Vic3RyKDEpIDogbmFtZSkuam9pbignOycpO1xuICAgIH1cblxuICAgIC8vIGlmIG1hdGNoIHNwZWNpZmllZCB3aXRoIHRhZyBjb21wYXJlIGV4YWN0bHlcbiAgICAvLyBpZiBtYXRjaCBzcGVjaWZpZWQgd2l0aG91dCB0YWcgY29tcGFyZSB1bnRhZ2dlZCBuYW1lc1xuICAgIHN0YXRpYyBpbWFnZU5hbWVNYXRjaGVkKGltYWdlTmFtZTogc3RyaW5nLCBtYXRjaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGltYWdlTmFtZSA9IGltYWdlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBtYXRjaCA9IG1hdGNoLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoUGFydHMgPSBtYXRjaC5zcGxpdCgnOicpO1xuICAgICAgICBpZiAobWF0Y2hQYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gaW1hZ2VOYW1lID09PSBtYXRjaDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZVBhcnRzID0gaW1hZ2VOYW1lLnNwbGl0KCc6Jyk7XG4gICAgICAgIHJldHVybiBpbWFnZVBhcnRzWzBdID09PSBtYXRjaFBhcnRzWzBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbWFnZU5hbWVzKGluZm86IERJbWFnZUluZm8pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi4oaW5mby5SZXBvVGFncyB8fCBbXSksXG4gICAgICAgICAgICAuLi4oaW5mby5SZXBvRGlnZXN0cyB8fCBbXSkubWFwKChkaWdlc3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlnZXN0LnNwbGl0KCdAJykuam9pbignOicpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGltYWdlSGFzTWF0Y2hlZE5hbWUoaW5mbzogREltYWdlSW5mbywgbWF0Y2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFEZXZEb2NrZXIuaW1hZ2VOYW1lcyhpbmZvKS5maW5kKG5hbWUgPT4gdGhpcy5pbWFnZU5hbWVNYXRjaGVkKG5hbWUsIG1hdGNoKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGlzUnVubmluZyhpbmZvOiA/RENvbnRhaW5lckluZm8pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhaW5mbyAmJiBpbmZvLlN0YXRlLnRvTG93ZXJDYXNlKCkgPT09ICdydW5uaW5nJztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29udGFpbmVyc0ltYWdlTWF0Y2hlZChpbmZvOiBEQ29udGFpbmVySW5mbywgbWF0Y2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWVNYXRjaGVkKGluZm8uSW1hZ2UsIG1hdGNoKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IHtcbiAgICBEZXZEb2NrZXIsXG59XG4iXX0=