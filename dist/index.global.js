var ExtensionBundle = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/RemoteBridge.js
  var require_RemoteBridge = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/RemoteBridge.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.RemoteBridge = exports.BridgeMessageType = void 0;
      var BridgeMessageType;
      (function(BridgeMessageType2) {
        BridgeMessageType2["LOG"] = "LOG";
        BridgeMessageType2["NOTIFY"] = "NOTIFY";
        BridgeMessageType2["SERVICE_CALL"] = "SERVICE_CALL";
        BridgeMessageType2["SERVICE_RESPONSE"] = "SERVICE_RESPONSE";
        BridgeMessageType2["EVENT"] = "EVENT";
        BridgeMessageType2["INITIALIZE"] = "INITIALIZE";
      })(BridgeMessageType || (exports.BridgeMessageType = BridgeMessageType = {}));
      var RemoteBridge = class {
        static init(handler) {
          window.addEventListener("message", (event) => {
            const message = event.data;
            if (!message || !message.type)
              return;
            if (message.type === BridgeMessageType.SERVICE_RESPONSE && message.callId) {
              const pending = this.pendingCalls.get(message.callId);
              if (pending) {
                if (message.error)
                  pending.reject(new Error(message.error));
                else
                  pending.resolve(message.payload);
                this.pendingCalls.delete(message.callId);
              }
            } else {
              handler(message);
            }
          });
        }
        static send(message, target = window.parent) {
          target.postMessage(message, "*");
        }
        static callRemote(type, payload) {
          const callId = Math.random().toString(36).substring(2, 9);
          return new Promise((resolve, reject) => {
            this.pendingCalls.set(callId, { resolve, reject });
            this.send({ type, payload, callId });
          });
        }
        static respond(callId, payload, error) {
          this.send({ type: BridgeMessageType.SERVICE_RESPONSE, payload, callId, error });
        }
      };
      exports.RemoteBridge = RemoteBridge;
      RemoteBridge.handlers = /* @__PURE__ */ new Map();
      RemoteBridge.pendingCalls = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ExtensionContext.js
  var require_ExtensionContext = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ExtensionContext.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ExtensionContext = void 0;
      var RemoteBridge_1 = require_RemoteBridge();
      var ExtensionContext2 = class {
        constructor(serviceRegistry = {}, componentRegistry = {}, isRemote = false) {
          this.extensionId = "";
          this.isRemote = false;
          this.serviceRegistry = serviceRegistry;
          this.componentRegistry = componentRegistry;
          this.isRemote = isRemote;
        }
        // Method to get a service by its interface name
        getService(serviceType) {
          if (this.isRemote) {
            return new Proxy({}, {
              get: (target, prop) => {
                if (typeof prop === "string") {
                  return (...args) => {
                    return RemoteBridge_1.RemoteBridge.callRemote(RemoteBridge_1.BridgeMessageType.SERVICE_CALL, {
                      service: serviceType,
                      method: prop,
                      args
                    });
                  };
                }
              }
            });
          }
          const service = this.serviceRegistry[serviceType];
          if (!service) {
            throw new Error(`Service "${serviceType}" not registered`);
          }
          return service;
        }
        getComponent(componentName) {
          return this.componentRegistry[componentName];
        }
        getAllComponents() {
          return this.componentRegistry;
        }
        setExtensionId(id) {
          this.extensionId = id;
        }
        registerAction(action) {
          if (this.isRemote) {
            RemoteBridge_1.RemoteBridge.send({
              type: RemoteBridge_1.BridgeMessageType.SERVICE_CALL,
              payload: { service: "ExtensionBridge", method: "registerAction", args: [this.extensionId, action] }
            });
            return;
          }
          const bridge = ExtensionBridge_1.ExtensionBridge.getInstance();
          if (this.extensionId) {
            bridge.registerAction(this.extensionId, action);
          } else {
            console.error("Cannot register action: Extension ID not set");
          }
        }
        unregisterAction(actionId) {
          if (this.isRemote) {
            RemoteBridge_1.RemoteBridge.send({
              type: RemoteBridge_1.BridgeMessageType.SERVICE_CALL,
              payload: { service: "ExtensionBridge", method: "unregisterAction", args: [`${this.extensionId}:${actionId}`] }
            });
            return;
          }
          const bridge = ExtensionBridge_1.ExtensionBridge.getInstance();
          bridge.unregisterAction(`${this.extensionId}:${actionId}`);
        }
        registerCommand(commandId, handler) {
          if (this.isRemote) {
            console.warn("Registering command handlers from remote views is not fully supported yet via bridge.");
            return;
          }
          const bridge = ExtensionBridge_1.ExtensionBridge.getInstance();
          if (this.extensionId) {
            bridge.registerCommand(`${this.extensionId}.${commandId}`, handler, this.extensionId);
          } else {
            console.error("Cannot register command: Extension ID not set");
          }
        }
        unregisterCommand(commandId) {
          if (this.isRemote)
            return;
          const bridge = ExtensionBridge_1.ExtensionBridge.getInstance();
          bridge.unregisterCommand(`${this.extensionId}.${commandId}`);
        }
      };
      exports.ExtensionContext = ExtensionContext2;
      var ExtensionBridge_1 = require_ExtensionBridge();
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ExtensionBridge.js
  var require_ExtensionBridge = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ExtensionBridge.js"(exports) {
      "use strict";
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ExtensionBridge = void 0;
      var ExtensionContext_1 = require_ExtensionContext();
      var ExtensionBridge = class _ExtensionBridge {
        constructor() {
          this.extensionManifests = /* @__PURE__ */ new Map();
          this.extensionImplementations = /* @__PURE__ */ new Map();
          this.serviceRegistry = {};
          this.componentRegistry = {};
          this.actionRegistry = /* @__PURE__ */ new Map();
          this.commandRegistry = /* @__PURE__ */ new Map();
        }
        // Singleton pattern
        static getInstance() {
          if (!_ExtensionBridge.instance) {
            _ExtensionBridge.instance = new _ExtensionBridge();
            console.log("ExtensionBridge created:", _ExtensionBridge.instance);
          }
          console.log("ExtensionBridge instance:", _ExtensionBridge.instance);
          return _ExtensionBridge.instance;
        }
        // Register a service implementation from the base app
        registerService(serviceType, implementation) {
          this.serviceRegistry[serviceType] = implementation;
          console.log(`Registered service: ${serviceType}`);
        }
        // Register a UI component from the base app
        registerComponent(componentName, component) {
          this.componentRegistry[componentName] = component;
          console.log(`Registered component: ${componentName}`);
        }
        // Get all registered services
        getServices() {
          return this.serviceRegistry;
        }
        // Get all registered components
        getComponents() {
          return this.componentRegistry;
        }
        // Get a registered component
        getComponent(componentName) {
          return this.componentRegistry[componentName];
        }
        // Get all registered components
        getAllComponents() {
          return this.componentRegistry;
        }
        // Register an action from an extension
        registerAction(extensionId, action) {
          const actionId = `${extensionId}:${action.id}`;
          this.actionRegistry.set(actionId, Object.assign(Object.assign({}, action), { id: actionId, extensionId }));
          console.log(`Registered action: ${actionId}`);
        }
        // Unregister an action
        unregisterAction(actionId) {
          this.actionRegistry.delete(actionId);
        }
        // Get all registered actions
        getActions() {
          return Array.from(this.actionRegistry.values());
        }
        // Register an extension manifest
        registerManifest(manifest) {
          this.extensionManifests.set(manifest.id, manifest);
          console.log(`Registered extension manifest: ${manifest.id} (${manifest.name} v${manifest.version})`);
        }
        // Register extension implementation
        registerExtensionImplementation(id, extension) {
          if (!this.extensionManifests.has(id)) {
            console.error(`Cannot register extension implementation: Manifest for ${id} not found`);
            return;
          }
          this.extensionImplementations.set(id, extension);
          console.log(`Registered extension implementation for: ${id}`);
        }
        // Initialize all registered extensions
        initializeExtensions() {
          return __awaiter(this, void 0, void 0, function* () {
            const context = new ExtensionContext_1.ExtensionContext(this.serviceRegistry);
            for (const [id, extension] of this.extensionImplementations.entries()) {
              const manifest = this.extensionManifests.get(id);
              if (!manifest) {
                console.error(`Cannot initialize extension: Manifest for ${id} not found`);
                continue;
              }
              console.log(`Initializing extension: ${manifest.id} (${manifest.name})`);
              context.setExtensionId(manifest.id);
              yield extension.initialize(context);
            }
          });
        }
        // Activate all registered extensions
        activateExtensions() {
          return __awaiter(this, void 0, void 0, function* () {
            for (const [id, extension] of this.extensionImplementations.entries()) {
              const manifest = this.extensionManifests.get(id);
              if (!manifest)
                continue;
              console.log(`Activating extension: ${manifest.id}`);
              yield extension.activate();
            }
          });
        }
        // Deactivate all registered extensions
        deactivateExtensions() {
          return __awaiter(this, void 0, void 0, function* () {
            for (const [id, extension] of this.extensionImplementations.entries()) {
              const manifest = this.extensionManifests.get(id);
              if (!manifest)
                continue;
              console.log(`Deactivating extension: ${manifest.id}`);
              yield extension.deactivate();
            }
          });
        }
        // Get all registered extension manifests
        getManifests() {
          return Array.from(this.extensionManifests.values());
        }
        // Get manifest by extension ID
        getManifest(id) {
          return this.extensionManifests.get(id);
        }
        // Get extension implementation by ID
        getExtensionImplementation(id) {
          return this.extensionImplementations.get(id);
        }
        // Register a command from an extension
        registerCommand(commandId, handler, extensionId) {
          this.commandRegistry.set(commandId, { handler, extensionId });
          console.log(`Registered command: ${commandId}`);
        }
        // Unregister a command
        unregisterCommand(commandId) {
          this.commandRegistry.delete(commandId);
        }
        // Execute a command
        executeCommand(commandId, args) {
          return __awaiter(this, void 0, void 0, function* () {
            const command = this.commandRegistry.get(commandId);
            if (!command) {
              throw new Error(`Command not found: ${commandId}`);
            }
            return command.handler.execute(args);
          });
        }
        // Get all registered commands
        getCommands() {
          return Array.from(this.commandRegistry.keys());
        }
        // Get commands for a specific extension
        getCommandsForExtension(extensionId) {
          return Array.from(this.commandRegistry.entries()).filter(([_, value]) => value.extensionId === extensionId).map(([key, _]) => key);
        }
      };
      exports.ExtensionBridge = ExtensionBridge;
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/components/index.js
  var require_components = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/components/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ConfirmDialog = exports.ShortcutRecorder = exports.SplitView = exports.Toggle = exports.Card = exports.Input = exports.Button = void 0;
      var ExtensionBridge_1 = require_ExtensionBridge();
      function createComponentProxy(componentName) {
        return function(...args) {
          const bridge = ExtensionBridge_1.ExtensionBridge.getInstance();
          const component = bridge.getComponent(componentName);
          if (!component) {
            console.error(`Component ${componentName} is not registered`);
            return null;
          }
          return component(...args);
        };
      }
      exports.Button = createComponentProxy("Button");
      exports.Input = createComponentProxy("Input");
      exports.Card = createComponentProxy("Card");
      exports.Toggle = createComponentProxy("Toggle");
      exports.SplitView = createComponentProxy("SplitView");
      exports.ShortcutRecorder = createComponentProxy("ShortcutRecorder");
      exports.ConfirmDialog = createComponentProxy("ConfirmDialog");
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ui/ViewBuilder.js
  var require_ViewBuilder = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/ui/ViewBuilder.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ViewBuilder = void 0;
      var ViewBuilder = class {
        /**
         * Creates a container element with the standard Asyar layout padding
         */
        static createContainer() {
          const div = document.createElement("div");
          div.className = "asyar-container p-6 w-full h-full overflow-y-auto";
          return div;
        }
        /**
         * Creates a heading element
         */
        static createHeading(text, level = 1) {
          const tag = `h${level}`;
          const h = document.createElement(tag);
          h.textContent = text;
          h.className = level === 1 ? "text-2xl font-bold mb-4" : "text-xl font-semibold mb-2";
          h.style.color = "var(--text-primary)";
          return h;
        }
        /**
         * Creates a paragraph element
         */
        static createText(text) {
          const p = document.createElement("p");
          p.textContent = text;
          p.className = "text-sm mb-4";
          p.style.color = "var(--text-secondary)";
          return p;
        }
        /**
         * Creates a button element
         */
        static createButton(text, onClick) {
          const btn = document.createElement("button");
          btn.textContent = text;
          btn.className = "btn btn-primary px-4 py-2 rounded-md transition-all";
          btn.onclick = onClick;
          return btn;
        }
        /**
         * Creates a list container
         */
        static createList() {
          const ul = document.createElement("ul");
          ul.className = "divide-y divide-[var(--separator)]";
          return ul;
        }
        /**
         * Creates a list item
         */
        static createListItem(title, subtitle, onClick) {
          const li = document.createElement("li");
          li.className = "py-3 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors px-2 rounded-lg";
          const titleDiv = document.createElement("div");
          titleDiv.className = "font-medium text-[var(--text-primary)]";
          titleDiv.textContent = title;
          li.appendChild(titleDiv);
          if (subtitle) {
            const subtitleDiv = document.createElement("div");
            subtitleDiv.className = "text-xs text-[var(--text-secondary)]";
            subtitleDiv.textContent = subtitle;
            li.appendChild(subtitleDiv);
          }
          if (onClick) {
            li.onclick = onClick;
          }
          return li;
        }
      };
      exports.ViewBuilder = ViewBuilder;
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/NotificationType.js
  var require_NotificationType = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/NotificationType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ExtensionType.js
  var require_ExtensionType = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ExtensionType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ClipboardType.js
  var require_ClipboardType = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ClipboardType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ClipboardItemType = void 0;
      var ClipboardItemType;
      (function(ClipboardItemType2) {
        ClipboardItemType2["Text"] = "text";
        ClipboardItemType2["Html"] = "html";
        ClipboardItemType2["Image"] = "image";
      })(ClipboardItemType || (exports.ClipboardItemType = ClipboardItemType = {}));
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ActionType.js
  var require_ActionType = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/ActionType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ActionContext = void 0;
      var ActionContext;
      (function(ActionContext2) {
        ActionContext2["GLOBAL"] = "global";
        ActionContext2["EXTENSION_VIEW"] = "extension_view";
        ActionContext2["SEARCH_VIEW"] = "search_view";
        ActionContext2["RESULT"] = "result";
        ActionContext2["CORE"] = "core";
        ActionContext2["COMMAND_RESULT"] = "command_result";
      })(ActionContext || (exports.ActionContext = ActionContext = {}));
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/CommandType.js
  var require_CommandType = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/CommandType.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/index.js
  var require_types = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/types/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_NotificationType(), exports);
      __exportStar(require_ExtensionType(), exports);
      __exportStar(require_ClipboardType(), exports);
      __exportStar(require_ActionType(), exports);
      __exportStar(require_CommandType(), exports);
    }
  });

  // node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/index.js
  var require_dist = __commonJS({
    "node_modules/.pnpm/asyar-api@file+..+..+asyar+asyar-api/node_modules/asyar-api/dist/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ActionContext = exports.ClipboardItemType = exports.ViewBuilder = exports.BridgeMessageType = exports.RemoteBridge = exports.ExtensionContext = exports.ExtensionBridge = void 0;
      var ExtensionBridge_1 = require_ExtensionBridge();
      Object.defineProperty(exports, "ExtensionBridge", { enumerable: true, get: function() {
        return ExtensionBridge_1.ExtensionBridge;
      } });
      var ExtensionContext_1 = require_ExtensionContext();
      Object.defineProperty(exports, "ExtensionContext", { enumerable: true, get: function() {
        return ExtensionContext_1.ExtensionContext;
      } });
      var RemoteBridge_1 = require_RemoteBridge();
      Object.defineProperty(exports, "RemoteBridge", { enumerable: true, get: function() {
        return RemoteBridge_1.RemoteBridge;
      } });
      Object.defineProperty(exports, "BridgeMessageType", { enumerable: true, get: function() {
        return RemoteBridge_1.BridgeMessageType;
      } });
      __exportStar(require_components(), exports);
      var ViewBuilder_1 = require_ViewBuilder();
      Object.defineProperty(exports, "ViewBuilder", { enumerable: true, get: function() {
        return ViewBuilder_1.ViewBuilder;
      } });
      var types_1 = require_types();
      Object.defineProperty(exports, "ClipboardItemType", { enumerable: true, get: function() {
        return types_1.ClipboardItemType;
      } });
      var ActionType_1 = require_ActionType();
      Object.defineProperty(exports, "ActionContext", { enumerable: true, get: function() {
        return ActionType_1.ActionContext;
      } });
      __exportStar(require_types(), exports);
    }
  });

  // index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  var import_asyar_api = __toESM(require_dist(), 1);
  var greetingExtension = {
    async initialize(context) {
      var _a;
      (_a = import_asyar_api.logService) == null ? void 0 : _a.info("Greeting extension initialized");
    },
    async activate() {
      var _a;
      (_a = import_asyar_api.logService) == null ? void 0 : _a.info("Greeting extension activated");
    },
    async deactivate() {
      var _a;
      (_a = import_asyar_api.logService) == null ? void 0 : _a.info("Greeting extension deactivated");
    },
    onUnload: null,
    async viewActivated(viewId) {
      var _a;
      (_a = import_asyar_api.logService) == null ? void 0 : _a.info(`View activated: ${viewId}`);
    },
    async viewDeactivated(viewId) {
      var _a;
      (_a = import_asyar_api.logService) == null ? void 0 : _a.info(`View deactivated: ${viewId}`);
    },
    async executeCommand(commandId, args) {
      if (commandId === "greeting-extension.greet") {
        return { success: true };
      }
    },
    async search(query) {
      if (!query || query.trim().length === 0) return [];
      if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("greet")) {
        return [{
          title: "Greet Me",
          subtitle: "Open the greeting view",
          score: 1,
          icon: "\u{1F44B}",
          type: "view",
          viewPath: "greeting-extension/GreetingView"
        }];
      }
      return [];
    }
  };
  var index_default = greetingExtension;
  return __toCommonJS(index_exports);
})();
