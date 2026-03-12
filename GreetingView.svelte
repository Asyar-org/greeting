<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { performance } from 'asyar-api';
  
  // State variables
  let name = '';
  let greeting = 'Hello';
  let showGreeting = false;
  let isLoading = true;
  let error = false;
  let errorMessage = '';
  let greetingOptions = ['Hello', 'Hi', 'Hey', 'Greetings', 'Welcome', 'Howdy'];
  let selectedGreetingIndex = 0;
  
  // Generate the full greeting message
  $: message = name.trim() 
    ? `${greeting}, ${name}!` 
    : 'Please enter your name';
    
  // Handle name input with debounce for better performance
  let nameInputTimeout: any;
  function handleNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    
    // Clear previous timeout
    if (nameInputTimeout) clearTimeout(nameInputTimeout);
    
    // Set a small debounce to prevent excessive updates
    nameInputTimeout = setTimeout(() => {
      name = value;
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('greeting-extension-name', name);
      } catch (e) {
        console.error('Could not save name to localStorage');
      }
    }, 50);
  }
  
  // Change the greeting type
  function changeGreeting() {
    selectedGreetingIndex = (selectedGreetingIndex + 1) % greetingOptions.length;
    greeting = greetingOptions[selectedGreetingIndex];
    
    // Save preference
    try {
      localStorage.setItem('greeting-extension-greeting-index', selectedGreetingIndex.toString());
    } catch (e) {
      console.error('Could not save greeting preference');
    }
  }
  
  // Show the greeting after a short delay when name is entered
  $: if (name.trim().length > 0 && !showGreeting) {
    setTimeout(() => {
      showGreeting = true;
    }, 300);
  }
  
  // Simulate a resource-intensive operation
  async function loadUserPreferences() {
    isLoading = true;
    
    try {
      console.log("Loading user preferences for greeting extension");
      
      // Simulate network delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Load saved preferences
      try {
        const savedName = localStorage.getItem('greeting-extension-name');
        if (savedName) name = savedName;
        
        const savedGreetingIndex = localStorage.getItem('greeting-extension-greeting-index');
        if (savedGreetingIndex) {
          selectedGreetingIndex = parseInt(savedGreetingIndex, 10) % greetingOptions.length;
          greeting = greetingOptions[selectedGreetingIndex];
        }
      } catch (e) {
        console.error('Could not load saved preferences:', e);
      }
    } catch (e) {
      error = true;
      errorMessage = `Error initializing view: ${e}`;
      console.error('Error loading greeting view:', e);
    } finally {
      isLoading = false;
    }
  }
  
  onMount(() => {
    console.log("Greeting view component mounted");
    performance.mark('greeting-view-mount-start');
    
    // Log that the component was successfully loaded
    console.log('Greeting view mounted - component rendering properly');
    
    // Load preferences
    loadUserPreferences().then(() => {
      // Focus the name input field when component is mounted and preferences are loaded
      setTimeout(() => {
        const inputElement = document.getElementById('name-input');
        if (inputElement) {
          console.log("Focusing input element");
          inputElement.focus();
        } else {
          console.warn("Could not find input element with id 'name-input'");
        }
      }, 100);
    });
    
    performance.mark('greeting-view-mount-end');
    performance.measure('greeting-view-mount-time', 'greeting-view-mount-start', 'greeting-view-mount-end');
  });
  
  onDestroy(() => {
    console.log('Greeting view destroyed');
    if (nameInputTimeout) clearTimeout(nameInputTimeout);
  });
  
  // Support keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    // Cmd+Enter or Ctrl+Enter to change greeting
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      changeGreeting();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="p-6 max-w-3xl mx-auto">
  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-1">Greeting Extension</h1>
    <p class="text-[var(--text-secondary)]">Customize your greeting below</p>
  </div>
  
  {#if error}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
      <p class="font-bold">Error</p>
      <p>{errorMessage || 'Something went wrong while loading the extension.'}</p>
      <p class="mt-3">Press Escape to return to the main screen.</p>
    </div>
  {:else if isLoading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
    </div>
  {:else}
    <div class="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-sm">
      <div class="mb-4">
        <label for="name-input" class="block text-sm font-medium mb-1 text-[var(--text-primary)]">
          Your Name
        </label>
        <input 
          id="name-input"
          type="text" 
          value={name} 
          on:input={handleNameInput} 
          placeholder="Enter your name" 
          class="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-input)] text-[var(--text-primary)]"
          autocomplete="off"
        />
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium mb-1 text-[var(--text-primary)]">
          Greeting Style
        </label>
        <div class="flex items-center">
          <span class="mr-3 text-[var(--text-primary)]">{greeting}</span>
          <button 
            on:click={changeGreeting} 
            class="px-3 py-1 bg-[var(--bg-button)] text-[var(--text-button)] rounded hover:bg-[var(--bg-button-hover)] transition-colors"
          >
            Change
          </button>
        </div>
        <div class="text-xs text-[var(--text-secondary)] mt-1">
          Tip: Press <kbd>⌘</kbd>+<kbd>Enter</kbd> to change greeting
        </div>
      </div>
      
      <div class="mt-8 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
        {#if showGreeting}
          <div class="text-center">
            <div class="text-3xl mb-2">👋</div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">{message}</h2>
            <p class="mt-2 text-sm text-[var(--text-secondary)]">Thanks for using the Greeting Extension!</p>
          </div>
        {:else}
          <p class="text-center text-[var(--text-secondary)]">{message}</p>
        {/if}
      </div>
    </div>
  {/if}
  
  <div class="mt-6 text-sm text-[var(--text-secondary)] text-center">
    <p>Press <kbd>Esc</kbd> to return to search</p>
  </div>
</div>

<style>
  /* Add any component-specific styles here */
  kbd {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    padding: 0 4px;
    font-size: 0.9em;
  }
</style>
