<script lang="ts">
	import { cl_join } from '@tools/cl_join';
	import { onDestroy, onMount } from 'svelte';
	import { type Writable } from 'svelte/store';
	import { scale, slide, fly } from 'svelte/transition';
	import { AiOutlineClose } from 'svelte-icons-pack/ai';
	import Icon from '@tools/Icon.svelte';

	export let modal_open: Writable<boolean>;
	export let cancel_btn_txt: string | null = null!;
	export let confirm_btn_txt: string | null = null!;
	export let onOpen: () => void = null!;
	export let onClose: () => void = null!;
	export let onConfirm: () => void = null!;

	let modalElement: HTMLElement;
	let opened = false;

	const lockScroll = () => {
		document.body.style.overflow = 'hidden';
	};

	const unlockScroll = () => {
		document.body.style.overflow = '';
	};

	const mode_open_unsubscriber = modal_open.subscribe((value) => {
		if (value && !opened) openModal();
		else if (!value && opened) closeModal();
	});
	onDestroy(() => {
		mode_open_unsubscriber();
	});

	const animationDuration = 400;
	let is_closing = false; // to fix transition not being displayed while exiting
	let visibleModal: HTMLElement | null = null;

	const openModal = () => {
		if (opened) return;
		setTimeout(() => {
			visibleModal = modalElement;
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
			$modal_open = false;
			if (onClose) onClose();
		}, animationDuration);
	};
	onMount(() => {
		document.addEventListener('click', (e) => {
			if (visibleModal && !visibleModal.querySelector('article')?.contains(e.target as Node)) {
				closeModal();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && visibleModal) {
				closeModal();
			}
		});
	});
</script>

<!-- Modal -->
<div
	transition:slide
	bind:this={modalElement}
	class={cl_join(
		'duration-400 fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all',
		!opened && 'hidden bg-opacity-0'
	)}
>
	{#if opened && !is_closing}
		<div
			in:scale={{ duration: animationDuration }}
			out:slide={{ duration: animationDuration }}
			class="mx-3 max-w-screen-lg"
		>
			<article class="rounded-lg bg-white p-3 pt-0 shadow-lg dark:bg-gray-800">
				<div class="flex justify-end">
					<button
						aria-label="Close"
						class="cursor-pointer text-gray-500 hover:text-gray-700"
						on:click={closeModal}><Icon src={AiOutlineClose} /></button
					>
				</div>
				<slot />
				{#if cancel_btn_txt || confirm_btn_txt}
					<footer class="mt-4 flex justify-end space-x-2">
						{#if cancel_btn_txt}
							<button class="variant-outline-error btn rounded-lg px-2.5 py-2" on:click={closeModal}
								>{cancel_btn_txt}</button
							>
						{/if}
						{#if confirm_btn_txt}
							<button
								class="variant-filled-secondary btn rounded-lg px-2.5 py-2"
								on:click={() => {
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
