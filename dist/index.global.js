var ExtensionBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  var GreetingExtension = class {
    onUnload;
    logService;
    extensionManager;
    context;
    async initialize(context) {
      var _a;
      this.context = context;
      this.logService = context.getService("LogService");
      this.extensionManager = context.getService("ExtensionManager");
      (_a = this.logService) == null ? void 0 : _a.info("Greeting extension initialized");
    }
    async activate() {
      var _a;
      (_a = this.logService) == null ? void 0 : _a.info("Greeting extension activated");
    }
    async deactivate() {
      var _a;
      (_a = this.logService) == null ? void 0 : _a.info("Greeting extension deactivated");
    }
    async viewActivated(viewId) {
      var _a;
      (_a = this.logService) == null ? void 0 : _a.info(`View activated: ${viewId}`);
    }
    async viewDeactivated(viewId) {
      var _a;
      (_a = this.logService) == null ? void 0 : _a.info(`View deactivated: ${viewId}`);
    }
    async executeCommand(commandId, args) {
      var _a;
      (_a = this.logService) == null ? void 0 : _a.info(`Executing command: ${commandId}`);
      return { success: true };
    }
    async search(query) {
      const lowerQuery = query.toLowerCase().trim();
      if (!lowerQuery) return [];
      if (lowerQuery.includes("hello") || lowerQuery.includes("greet") || lowerQuery.includes("greeting")) {
        return [{
          id: "greeting-view-result",
          title: "Greet Me",
          subtitle: "Open the greeting view",
          score: 1,
          icon: "\u{1F44B}",
          type: "view",
          viewPath: "greeting-extension/GreetingView",
          onAction: () => {
            var _a;
            (_a = this.extensionManager) == null ? void 0 : _a.navigateToView("greeting-extension/GreetingView");
          }
        }];
      }
      return [];
    }
  };
  var index_default = new GreetingExtension();
  return __toCommonJS(index_exports);
})();
