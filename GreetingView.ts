import { mount } from 'svelte';
import GreetingView from './GreetingView.svelte';

function mountView(target: HTMLElement, context: any) {
  return mount(GreetingView, {
    target,
    props: {
      context
    }
  });
}

module.exports = mountView;
