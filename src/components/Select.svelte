<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';

  export let zodType: any = z.string();
  export let value: any;
  let className: string = undefined!;
  export let disabled = false;
  export { className as class };
  export let options: {
    value: any;
    text: string;
    className?: string | undefined;
  }[];
  export let resize = false;

  const dispatch = createEventDispatcher<{
    change: {
      value: any;
      currentTarget: HTMLSelectElement;
    };
  }>();

  let width = 0;
  let mounted = false;
  onMount(() => {
    if (resize) width = resize_select(elm);
    mounted = true;
  });

  let elm: HTMLSelectElement;

  const on_change = (
    e: Event & {
      currentTarget: EventTarget & HTMLSelectElement;
    }
  ) => {
    const { currentTarget } = e;
    if (resize) width = resize_select(currentTarget);
    value = zodType.parse(currentTarget.value);
    dispatch('change', { value, currentTarget });
  };

  const replace_all = (str: string, replaceWhat: string, replaceTo: string) => {
    replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re = new RegExp(replaceWhat, 'g');
    return str.replace(re, replaceTo);
  };
  const resize_select = (target: HTMLSelectElement, extra = 0) => {
    target.style.removeProperty('width');
    let i = target.innerHTML;
    let o = target.outerHTML;
    o = replace_all(o, i, '');
    const tmp_el = document.createElement('div');
    tmp_el.innerHTML = o;
    const elm = tmp_el.firstChild! as HTMLSelectElement;
    elm.innerHTML = `<option>${target.querySelector('option:checked')?.innerHTML}</option>`;
    document.body.appendChild(elm);
    const wdth = elm.offsetWidth + extra;
    elm.remove();
    return wdth;
  };
</script>

<select
  bind:this={elm}
  {disabled}
  on:change={on_change}
  class={className}
  style:width={resize && mounted ? `${width}px` : null}
>
  {#each options as item (item.value)}
    {#if mounted || item.value === value}
      <option value={item.value} class={item.className} selected={item.value === value}
        >{item.text}</option
      >
    {/if}
  {/each}
</select>
