<script lang="ts">
  import type { IconType } from 'svelte-icons-pack';
  import { cl_join } from './cl_join';
  
  interface Props {
    src: IconType;
    title?: string | undefined;
    outerClass?: string | undefined;
    class?: string;
    viewBox?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    src,
    title = undefined,
    outerClass = undefined,
    class: className = '',
    viewBox = undefined,
    children
  }: Props = $props();
  let innerHtml: string = $derived((title ? `<title>${title}</title>` : '') + src.c);

  
</script>

<span class={outerClass}>
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    class={cl_join('inline-block', className)}
    {viewBox}
    height="1em"
    width="1em"
    {...src.a}
    xmlns="http://www.w3.org/2000/svg"
  >
    {@html innerHtml}
  </svg>
  {@render children?.()}
</span>
