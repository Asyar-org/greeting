import {
  Extension,
  ExtensionContext,
  ExtensionResult,
  IExtensionManager,
  ILogService,
} from "asyar-api";

class GreetingExtension implements Extension {
  onUnload: any;

  private logService?: ILogService;
  private extensionManager?: IExtensionManager;
  private context?: ExtensionContext;

  async initialize(context: ExtensionContext): Promise<void> {
    this.context = context;
    this.logService = context.getService<ILogService>("LogService");
    this.extensionManager = context.getService<IExtensionManager>("ExtensionManager");
    this.logService?.info("Greeting extension initialized");
  }

  async activate(): Promise<void> {
    this.logService?.info("Greeting extension activated");
  }

  async deactivate(): Promise<void> {
    this.logService?.info("Greeting extension deactivated");
  }

  async viewActivated(viewId: string): Promise<void> {
    this.logService?.info(`View activated: ${viewId}`);
  }

  async viewDeactivated(viewId: string): Promise<void> {
    this.logService?.info(`View deactivated: ${viewId}`);
  }

  async executeCommand(commandId: string, args?: Record<string, any>): Promise<any> {
    this.logService?.info(`Executing command: ${commandId}`);
    return { success: true };
  }

  async search(query: string): Promise<ExtensionResult[]> {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];
    
    if (lowerQuery.includes("hello") || lowerQuery.includes("greet") || lowerQuery.includes("greeting")) {
      return [{
        id: "greeting-view-result",
        title: "Greet Me",
        subtitle: "Open the greeting view",
        score: 1.0,
        icon: "👋",
        type: "view",
        viewPath: "greeting-extension/GreetingView",
        onAction: () => {
          this.extensionManager?.navigateToView("greeting-extension/GreetingView");
        }
      }];
    }
    return [];
  }
}

export default new GreetingExtension();
