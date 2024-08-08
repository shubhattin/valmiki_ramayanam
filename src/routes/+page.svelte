<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import { FileButton, Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { slide, scale, fly } from 'svelte/transition';
	import { LANG_LIST } from '@tools/lang_list';
	import Icon from '@tools/Icon.svelte';
	import { IoOptions } from 'svelte-icons-pack/io';
	import { AiOutlineDelete } from 'svelte-icons-pack/ai';
	import { VscDebugStart, VscPreview } from 'svelte-icons-pack/vsc';
	import { OiGear16 } from 'svelte-icons-pack/oi';
	import { FiCircle } from 'svelte-icons-pack/fi';
	import { TiTick } from 'svelte-icons-pack/ti';
	import { BiSolidDownload } from 'svelte-icons-pack/bi';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import ExcelJS from 'exceljs';
	import { delay } from '@tools/delay';
	import { transliterate_xlxs_file } from './xlsx_parivartak';

	export const modalStore = getModalStore();

	let file_list: FileList;
	let file_download_links: string[] = [];
	// let file_list = [{ name: 'vAlamIki.xlsx' }, { name: 'nArada.xlxs' }]; // @warn

	// default options
	let lang_row_index: number = 1;
	let text_col_index: number = 2;
	let text_row_start_index: number = 2;
	let base_lang_code: string = 'Sanskrit';

	let transliterated_atleast_once = false;
	let now_processing = false;

	function clear_file_list() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure to clear all loaded files ?',
			response: (resp: boolean) => {
				if (!resp) return;
				file_list = null!;
				transliterated_atleast_once = false;
			}
		};
		modalStore.trigger(modal);
	}

	async function start_transliteration() {
		const get_workbook_obj_from_file = (file: File) => {
			return new Promise<ExcelJS.Workbook>((resolve) => {
				const workbook = new ExcelJS.Workbook();
				const reader = new FileReader();
				reader.onload = async (event) => {
					const data = event.target?.result;
					if (data instanceof ArrayBuffer) {
						await workbook.xlsx.load(data);
						resolve(workbook);
						return;
					}
				};
				reader.readAsArrayBuffer(file);
			});
		};
		now_processing = true;
		file_download_links = [];
		for (let file of file_list) {
			if (!file) continue;
			const workbook = await get_workbook_obj_from_file(file);
			await transliterate_xlxs_file(
				workbook,
				'all',
				lang_row_index,
				text_col_index,
				text_row_start_index,
				base_lang_code
			);
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const downloadLink = URL.createObjectURL(blob);
			file_download_links.push(downloadLink);
		}
		await delay(400);
		now_processing = false;
		transliterated_atleast_once = true;
	}

	const download_file = (file_index: number) => {
		const file = file_list[file_index];
		const download_link = file_download_links[file_index];

		const a = document.createElement('a');
		a.href = download_link;
		a.download = `${file.name.substring(0, file.name.length - 5)}_transliterated.xlsx`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		// URL.revokeObjectURL(download_link);
	};
</script>

<svelte:head>
	<title>Lipi Parivartan</title>
</svelte:head>
<MainAppBar>
	<div slot="start" class="font-bold">Lipi Parivartan for Excel Files</div>
</MainAppBar>
<div class="mt-3 space-y-4">
	{#if !file_list}
		<div in:scale out:slide>
			<FileButton
				bind:files={file_list}
				multiple={true}
				name="files"
				accept=".xlsx"
				button="btn variant-filled-tertiary">Select Excel files</FileButton
			>
		</div>
	{/if}
	{#if file_list && file_list.length !== 0}
		<Accordion>
			<AccordionItem open={false}>
				<svelte:fragment slot="lead"><Icon src={IoOptions} class="text-3xl" /></svelte:fragment>
				<svelte:fragment slot="summary"
					><span class="font-bold">Change Default Options</span></svelte:fragment
				>
				<svelte:fragment slot="content">
					<label class="block space-x-2">
						<span>Language Row Number</span>
						<input
							type="number"
							bind:value={lang_row_index}
							class="inline-block rounded-lg dark:bg-surface-700"
						/>
					</label>
					<label class="block space-x-2">
						<span>Text Column Number</span>
						<input
							type="number"
							bind:value={text_col_index}
							class="inline-block rounded-lg dark:bg-surface-700"
						/>
					</label>
					<label class="block space-x-2">
						<span>Text Row Start Number</span>
						<input
							type="number"
							bind:value={text_row_start_index}
							class="inline-block rounded-lg dark:bg-surface-700"
						/>
					</label>
					<label class="block space-y-1">
						<span>Base Language</span>
						<select class="select" bind:value={base_lang_code}>
							{#each LANG_LIST as lang (lang)}
								<option value={lang}>{lang}</option>
							{/each}
						</select>
					</label>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
		<button class="btn variant-filled-error flex" on:click={clear_file_list}>
			<Icon src={AiOutlineDelete} class="text-2xl mr-1" />
			Clear File List
		</button>
		<ul
			transition:slide
			class="list border-2 border-amber-800 dark:border-yellow-600 rounded-lg p-2"
		>
			{#each file_list as file, file_index (file.name)}
				<li class="font-bold">
					<span class="mr-2.5">
						{#if now_processing}
							<Icon src={OiGear16} class="animate-spin text-xl" />
						{:else if !transliterated_atleast_once}
							<Icon src={FiCircle} class="text-xl text-zinc-500" />
						{:else}
							<Icon src={TiTick} class="text-xl dark:text-green-500 text-green-600" />
						{/if}
						{#if transliterated_atleast_once}
							<span in:fly>
								<button
									class="btn p-0 m-0"
									disabled={now_processing}
									on:click={() => download_file(file_index)}
									><Icon
										src={BiSolidDownload}
										class="text-xl dark:hover:text-gray-400 hover:text-gray-500 active:text-green-600"
									/></button
								>
								<button class="btn p-0 m-0" disabled={now_processing}
									><Icon
										src={VscPreview}
										class="text-xl dark:hover:text-slate-400 hover:text-slate-500 active:text-blue-600"
									/></button
								>
							</span>
						{/if}
					</span>
					{file.name}
				</li>
			{/each}
		</ul>
		<button
			on:click={start_transliteration}
			disabled={now_processing}
			class="btn variant-outline-success font-bold dark:text-white text-green-700 flex"
		>
			<Icon src={VscDebugStart} class="text-2xl mr-1" />
			Start Transliteration
		</button>
	{/if}
</div>
