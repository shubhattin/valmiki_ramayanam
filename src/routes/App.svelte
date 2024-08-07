<script lang="ts">
	import ExcelJS from 'exceljs';

	let file: File | null = null;
	let downloadLink: string | null = null;

	const handleFileSelect = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
		}
	};

	const processExcelFile = async () => {
		if (!file) return;

		const workbook = new ExcelJS.Workbook();
		const reader = new FileReader();

		reader.onload = async (event) => {
			const data = event.target?.result;
			if (data instanceof ArrayBuffer) {
				await workbook.xlsx.load(data);

				const worksheet = workbook.getWorksheet(2)!; // Modify based on your sheet
				worksheet.getCell(2, 3).value = 'New TestValue'; // Modify specific cell
				worksheet.getRow(1).eachCell((v, i) => {
					console.log([i, v.value]);
				});

				// const buffer = await workbook.xlsx.writeBuffer();
				// const blob = new Blob([buffer], {
				// 	type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				// });
				// downloadLink = URL.createObjectURL(blob);
			}
		};

		reader.readAsArrayBuffer(file);
	};

	const downloadFile = () => {
		if (downloadLink) {
			const a = document.createElement('a');
			a.href = downloadLink;
			a.download = 'modified.xlsx';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(downloadLink);
		}
	};
</script>

<div class="space-y-3">
	<input type="file" accept=".xlsx" on:change={handleFileSelect} />
	<button class="block btn variant-filled-primary" on:click={processExcelFile}>Process File</button>
	<button class="block btn variant-outline-success" on:click={downloadFile} disabled={!downloadLink}
		>Download Modified File</button
	>
</div>
