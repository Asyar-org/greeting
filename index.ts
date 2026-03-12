import {
  Extension,
  ExtensionContext,
  ExtensionResult,
  logService
} from "asyar-api";

const greetingExtension: Extension = {
  async initialize(context: ExtensionContext): Promise<void> {
    logService?.info("Greeting extension initialized");
  },

  async activate(): Promise<void> {
    logService?.info("Greeting extension activated");
  },

  async deactivate(): Promise<void> {
    logService?.info("Greeting extension deactivated");
  },

  onUnload: null,

  async viewActivated(viewId: string): Promise<void> {
    logService?.info(`View activated: ${viewId}`);
  },

  async viewDeactivated(viewId: string): Promise<void> {
    logService?.info(`View deactivated: ${viewId}`);
  },

  async executeCommand(commandId: string, args?: Record<string, any>): Promise<any> {
    if (commandId === "greeting-extension.greet") {
      // In the new architecture, we'll mostly use navigateToView
      // but we can still have logic here.
      return { success: true };
    }
  },

  async search(query: string): Promise<ExtensionResult[]> {
    if (!query || query.trim().length === 0) return [];
    
    if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("greet")) {
      return [{
        title: "Greet Me",
        subtitle: "Open the greeting view",
        score: 1.0,
        icon: "👋",
        type: "view",
        viewPath: "greeting-extension/GreetingView"
      }];
    }
    return [];
  }
};

export default greetingExtension;
