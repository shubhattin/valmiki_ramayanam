import readline from 'readline';
import { existsSync } from 'fs';
import { mkdirSync } from 'fs';

export async function take_input(prompt: string) {
	return new Promise<string>((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

export function make_dir(folderPath: string) {
	if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true });
}

export const dbMode = (() => {
	const args = process.argv.slice(2);
	if (args.length !== 0)
		if (args[0] === '--prod') return 'PROD';
		else if (args[0] === '--preview') return 'PREVIEW';
	return 'LOCAL';
})();
