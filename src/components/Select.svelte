<script lang="ts">
  import { onMount } from 'svelte';
  import { z } from 'zod';
  import { cl_join } from '~/tools/cl_join';

  type Props = {
    zodType?: any;
    value: any;
    class?: string;
    disabled?: boolean;
    options: {
      value: any;
      text: string;
      className?: string | undefined;
    }[];
    resize?: boolean;
    onchange?: (
      e: Event & {
        currentTarget: EventTarget & HTMLSelectElement;
      }
    ) => void;
  };

  let {
    zodType = z.string(),
    value = $bindable(),
    class: className = undefined!,
    disabled = false,
    options,
    resize = false,
    onchange
  }: Props = $props();

  let width = $state(0);
  let mounted = $state(false);
  onMount(() => {
    if (resize && elm) width = resize_select(elm);
    mounted = true;
  });

  let elm = $state<HTMLSelectElement>();

  const on_change_func = (
    e: Event & {
      currentTarget: EventTarget & HTMLSelectElement;
    }
  ) => {
    const { currentTarget } = e;
    if (resize) width = resize_select(currentTarget);
    value = zodType.parse(currentTarget.value);
    onchange && onchange(e);
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
  onchange={on_change_func}
  class={cl_join(className, 'inline-block')}
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
