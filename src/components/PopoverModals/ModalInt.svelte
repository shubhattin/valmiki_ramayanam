<script lang="ts">
  import { cl_join } from '~/tools/cl_join';
  import { onMount } from 'svelte';
  import { scale, slide } from 'svelte/transition';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import Icon from '~/tools/Icon.svelte';
  import { untrack } from 'svelte';

  interface Props {
    class?: string | null;
    outterClass?: string | null;
    modal_open: boolean;
    cancel_btn_txt?: string | null;
    confirm_btn_txt?: string | null;
    onOpen?: () => void;
    onClose?: () => void;
    onConfirm?: () => void;
    close_on_click_outside?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    class: className = null!,
    outterClass = null!,
    modal_open = $bindable(),
    cancel_btn_txt = null!,
    confirm_btn_txt = null!,
    onOpen = null!,
    onClose = null!,
    onConfirm = null!,
    close_on_click_outside = true,
    children
  }: Props = $props();

  let modalElement = $state<HTMLElement>();
  let opened = $state(false);

  const lockScroll = () => {
    document.body.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.body.style.overflow = '';
  };

  const animationDuration = 400;
  let is_closing = $state(false); // to fix transition not being displayed while exiting
  let visibleModal: HTMLElement | null = null;

  const openModal = () => {
    if (opened) return;
    setTimeout(() => {
      modalElement && (visibleModal = modalElement);
    }, animationDuration);
    opened = true;
    lockScroll();
    if (onOpen) onOpen();
  };
  const closeModal = () => {
    if (!opened) return;
    visibleModal = null;
    is_closing = true;
    setTimeout(() => {
      opened = false;
      is_closing = false;
      unlockScroll();
      modal_open = false;
      if (onClose) onClose();
    }, animationDuration);
  };
  onMount(() => {
    document.addEventListener('click', (e) => {
      if (
        close_on_click_outside &&
        visibleModal &&
        !visibleModal.querySelector('article')?.contains(e.target as Node)
      ) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (close_on_click_outside && e.key === 'Escape' && visibleModal) {
        closeModal();
      }
    });
  });
  $effect(() => {
    const _opened = untrack(() => opened);
    if (modal_open && !_opened) openModal();
    else if (!modal_open && _opened) closeModal();
  });
</script>

<!-- Modal -->
<div
  transition:slide
  bind:this={modalElement}
  class={cl_join(
    'bg-opacity-50 fixed inset-0  z-50 flex max-h-full max-w-full items-center justify-center bg-black transition-all duration-400',
    !opened && 'bg-opacity-0 hidden',
    outterClass ?? ''
  )}
>
  {#if opened && !is_closing}
    <div
      in:scale={{ duration: animationDuration }}
      out:slide={{ duration: animationDuration }}
      class={cl_join('mx-3 max-h-[97%] max-w-[97%] overflow-scroll', className)}
    >
      <div class="flex w-[97%] justify-end">
        <button
          aria-label="Close"
          class="absolute cursor-pointer text-gray-500 hover:text-gray-700"
          onclick={closeModal}><Icon src={AiOutlineClose} /></button
        >
      </div>
      <article class="overflow-scroll rounded-lg bg-white p-3 pt-2 shadow-lg dark:bg-gray-800">
        {@render children?.()}
        {#if cancel_btn_txt || confirm_btn_txt}
          <footer class="mt-4 flex justify-end space-x-2">
            {#if cancel_btn_txt}
              <button class="variant-outline-error btn rounded-lg px-2.5 py-2" onclick={closeModal}
                >{cancel_btn_txt}</button
              >
            {/if}
            {#if confirm_btn_txt}
              <button
                class="variant-filled-secondary btn rounded-lg px-2.5 py-2"
                onclick={() => {
                  closeModal();
                  if (onConfirm) onConfirm();
                }}>{confirm_btn_txt}</button
              >
            {/if}
          </footer>
        {/if}
      </article>
    </div>
  {/if}
</div>
