import { mount } from 'svelte';
import GreetingView from './GreetingView.svelte';

export default function(target, context) {
  return mount(GreetingView, {
    target,
    props: { context }
  });
}
