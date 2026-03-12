import { performance } from "asyar-api";
import type { CommandProps } from "asyar-api";

/**
 * Direct command handler that doesn't rely on circular imports
 */
export function Command(props: CommandProps): void {
  console.log("Greeting command executed with args:", props.arguments);
  performance.mark("greeting-start");

  try {
    // Use window object to avoid circular imports
    if (window && window.__asyar && window.__asyar.stores) {
      window.__asyar.stores.activeView.set("greeting-extension/GreetingView");
      window.__asyar.stores.activeViewSearchable.set(false);
    } else {
      // Fallback using dynamic import with specific error handling
      import("../../stores/extensionStore")
        .then((stores) => {
          stores.activeView.set("greeting-extension/GreetingView");
          stores.activeViewSearchable.set(false);
        })
        .catch((error) => {
          console.error("Failed to import stores:", error);
          if (props.onExit) props.onExit(error);
        });
    }

    // Successfully setup the view without errors
    performance.mark("greeting-end");
    performance.measure(
      "greeting-execution-time",
      "greeting-start",
      "greeting-end"
    );
  } catch (error) {
    console.error("Error in greeting command:", error);
    if (props.onExit) props.onExit(error);
  }
}

// Also export as default for compatibility with different import styles
export default Command;
