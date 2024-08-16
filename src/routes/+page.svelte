<script lang="ts">
	import MainAppBar from '@components/MainAppBar.svelte';
	import { FileButton, Accordion, AccordionItem, popup } from '@skeletonlabs/skeleton';
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
	import { BiSolidDownload, BiBookOpen } from 'svelte-icons-pack/bi';
	import { SiConvertio } from '@components/icons';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import ExcelJS from 'exceljs';
	import type { Workbook } from 'exceljs';
	import { delay } from '@tools/delay';
	import { transliterate_xlxs_file } from './xlsx_parivartak';
	import { writable } from 'svelte/store';
	import Preview from './Preview.svelte';

	export const modalStore = getModalStore();

	let file_download_links: string[] = [];
	let file_workbooks: Workbook[] = [];
	let file_list: FileList;
	// let file_list = [{ name: 'vAlamIki.xlsx' }, { name: 'nArada.xlxs' }]; // @warn

	// default options
	let lang_row_index = 1;
	let text_col_index = 2;
	let text_row_start_index = 2;
	let base_lang_code = 'Sanskrit';
	let file_name_prefix = '';
	let file_name_postfix = '_transliterated';

	let transliterated_atleast_once = false;
	let now_processing = false;

	let file_preview_opened = writable(false);
	let current_workbook: Workbook;
	let current_file_preview_link: string;
	let current_file_name: string;

	function clear_file_list() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure to clear all loaded files ?',
			response: (resp: boolean) => {
				if (!resp) return;
				file_list = null!;
				$file_preview_opened = false;
				current_workbook = null!;
				current_file_name = null!;
				current_file_preview_link = null!;
				transliterated_atleast_once = false;

				// resetting the defaults as well
				lang_row_index = 1;
				text_col_index = 2;
				text_row_start_index = 2;
				base_lang_code = 'Sanskrit';
				file_name_prefix = '';
				file_name_postfix = '_transliterated';
			}
		};
		modalStore.trigger(modal);
	}

	async function start_transliteration() {
		const get_workbook_obj_from_file = (file: File) => {
			return new Promise<Workbook>(async (resolve) => {
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
		file_workbooks = [];
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
			file_workbooks.push(workbook);
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
		a.download = get_file_name_with_prefix_postfix(file.name);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		// URL.revokeObjectURL(download_link);
	};

	const get_file_name_with_prefix_postfix = (name: string) => {
		const base_name = `${name.substring(0, name.length - 5)}`;
		return `${file_name_prefix}${base_name}${file_name_postfix}.xlsx`;
	};

	const PAGE_INFO = {
		title: 'Lipi Parivartan',
		desciption: 'A Utility to transliterate text in Excel files for Indian Scripts'
	};
</script>

<svelte:head>
	<title>Lipi Parivartan</title>
	<meta property="og:title" content={PAGE_INFO.title} />
	<meta name="description" content={PAGE_INFO.desciption} />
	<meta property="og:description" content={PAGE_INFO.desciption} />
	<meta property="og:site_name" content={PAGE_INFO.title} />
</svelte:head>
<MainAppBar>
	<span slot="start" class="font-bold">Lipi Parivartan for Excel Files</span>
	<span slot="end" class="space-x-2">
		<a
			class="text-xl"
			href="/books/ramayan"
			use:popup={{
				event: 'hover',
				target: 'ramayan_popup',
				placement: 'bottom'
			}}
		>
			<Icon src={BiBookOpen} class="text-2xl hover:fill-red-700 dark:hover:fill-sky-500" />
			<div data-popup="ramayan_popup" class="variant-ghost-tertiary px-1 text-base">
				श्रीमद्रामायणम्
				<div class="bg-surface-100-800-token arrow" />
			</div>
		</a>
		<a
			class="text-xl"
			href="/convert"
			use:popup={{
				event: 'hover',
				target: 'convert_popup',
				placement: 'bottom'
			}}
		>
			<Icon src={SiConvertio} class="text-2xl hover:fill-red-700 dark:hover:fill-sky-500" />
			<div data-popup="convert_popup" class="variant-ghost-tertiary px-1 text-base">
				Lipi Parivartak
				<div class="bg-surface-100-800-token arrow" />
			</div>
		</a>
	</span>
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
			<!-- @warn -->
			<AccordionItem open={false}>
				<svelte:fragment slot="lead"><Icon src={IoOptions} class="text-3xl" /></svelte:fragment>
				<svelte:fragment slot="summary"
					><span class="font-bold">Change Default Options</span></svelte:fragment
				>
				<svelte:fragment slot="content">
					<label class="block space-x-2">
						<span>Language Row Number</span>
						<input type="number" bind:value={lang_row_index} class="input w-16 rounded-lg" />
					</label>
					<label class="block space-x-2">
						<span>Text Column Number</span>
						<input type="number" bind:value={text_col_index} class="input w-16 rounded-lg" />
					</label>
					<label class="block space-x-2">
						<span>Text Row Start Number</span>
						<input type="number" bind:value={text_row_start_index} class="input w-16 rounded-lg" />
					</label>
					<label class="block">
						<span class="mr-2">Transliterated file name template</span>
						<input type="text" bind:value={file_name_prefix} class="input w-28 rounded-lg p-1" />
						<input
							type="text"
							value="file_name"
							disabled={true}
							class="input w-20 rounded-lg p-1"
						/>
						<input type="text" bind:value={file_name_postfix} class="input w-36 rounded-lg p-1" />
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
		<button class="variant-filled-error btn flex" on:click={clear_file_list}>
			<Icon src={AiOutlineDelete} class="mr-1 text-2xl" />
			Clear File List
		</button>
		<ul
			transition:slide
			class="list rounded-lg border-2 border-amber-800 p-2 dark:border-yellow-600"
		>
			{#each file_list as file, file_index (file.name)}
				<li class="font-bold">
					<span class="mr-2.5">
						{#if now_processing}
							<Icon src={OiGear16} class="animate-spin text-xl" />
						{:else if !transliterated_atleast_once}
							<Icon src={FiCircle} class="text-xl text-zinc-500" />
						{:else}
							<Icon src={TiTick} class="text-xl text-green-600 dark:text-green-500" />
						{/if}
						{#if transliterated_atleast_once}
							<span in:fly>
								<button
									class="btn m-0 p-0"
									disabled={now_processing}
									on:click={() => download_file(file_index)}
									><Icon
										src={BiSolidDownload}
										class="text-xl hover:text-gray-500 active:text-green-600 dark:hover:text-gray-400"
									/></button
								>
								<button
									class="btn m-0 p-0"
									disabled={now_processing}
									on:click={() => {
										current_workbook = file_workbooks[file_index];
										current_file_preview_link = file_download_links[file_index];
										current_file_name = get_file_name_with_prefix_postfix(file.name);
										$file_preview_opened = true;
									}}
									><Icon
										src={VscPreview}
										class="text-xl hover:text-slate-500 active:text-blue-600 dark:hover:text-slate-400"
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
			class="variant-outline-success btn flex font-bold text-green-700 dark:text-white"
		>
			<Icon src={VscDebugStart} class="mr-1 text-2xl" />
			Start Transliteration
		</button>
		{#if $file_preview_opened}
			<Preview
				workbook={current_workbook}
				{file_preview_opened}
				file_name={current_file_name}
				file_link={current_file_preview_link}
			/>
		{/if}
	{/if}
</div>
