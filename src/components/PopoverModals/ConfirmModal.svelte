<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';
  import { cl_join } from '~/tools/cl_join';

  let {
    children,
    popup_state = $bindable(),
    title,
    body,
    cancel_func,
    confirm_func,
    close_on_confirm = false,
    contentBase,
    class: className,
    triggerBase
  }: {
    children?: Snippet;
    confirm_func?: () => void;
    cancel_func?: () => void;
    title: string;
    body?: () => string;
    popup_state: boolean;
    contentBase?: string;
    close_on_confirm?: boolean;
    class?: string;
    triggerBase?: string;
  } = $props();

  let body_text = $derived(body ? body() : null);
</script>

<Modal
  open={popup_state}
  onOpenChange={(e) => {
    popup_state = e.open;
  }}
  contentBase={cl_join(
    'card z-70 space-y-2 p-2 rounded-lg shadow-xl dark:bg-surface-900 bg-zinc-100',
    contentBase
  )}
  backdropClasses="backdrop-blur-xs"
  triggerBase={cl_join(triggerBase)}
>
  {#snippet trigger()}
    {@render children?.()}
  {/snippet}
  {#snippet content()}
    <div class={cl_join('text-lg font-bold', className)}>{title}</div>
    {#if body_text}
      <div class="my-2 mb-3">
        {@html body_text}
      </div>
    {/if}
    <div class="space-x-2">
      <button
        class={cl_join(
          'btn-hover btn rounded-lg bg-zinc-500 font-semibold text-white dark:bg-surface-700',
          className
        )}
        onclick={() => {
          if (close_on_confirm) popup_state = false;
          confirm_func && confirm_func();
        }}
      >
        Confirm
      </button>
      <button
        onclick={() => {
          popup_state = false;
          cancel_func && cancel_func();
        }}
        class={cl_join(
          'btn-hover btn rounded-lg preset-outlined-surface-800-200 font-semibold',
          className
        )}
      >
        Cancel
      </button>
    </div>
  {/snippet}
</Modal>
