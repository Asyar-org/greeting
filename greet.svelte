<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { performance } from 'asyar-api';
  import type { CommandProps } from 'asyar-api';
  import { activeView, activeViewSearchable } from "../../stores/extensionStore";
  
  // Export Command function that follows the same pattern as Raycast extensions
  export function Command(props: CommandProps) {
    console.log("Greeting command executed with args:", props.arguments);
    performance.mark("greeting-start");
    
    // We can't return JSX like in React/Raycast, so instead we'll use Svelte's lifecycle
    
    // Set the exit handler for proper lifecycle
    props.onExit = (error) => {
      performance.mark("greeting-end");
      performance.measure(
        "greeting-execution-time",
        "greeting-start",
        "greeting-end"
      );

      if (error) {
        console.error("Greeting command exited with error:", error);
      } else {
        console.log("Greeting command exited normally");
      }
    };
    
    // Immediately set the active view
    activeView.set("greeting-extension/GreetingView");
    activeViewSearchable.set(false);
  }
  
  // This component doesn't render anything since it's just a command handler
  // The actual UI is in GreetingView.svelte
</script>

<!-- Empty component - this file just exports the Command function -->
