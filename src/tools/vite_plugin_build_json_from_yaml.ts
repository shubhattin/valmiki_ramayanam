import type { PluginOption } from 'vite';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

function walk_files(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(walk_files(filePath));
    } else {
      results.push(path.join(dir, file));
    }
  });

  return results;
}

export async function _build_json_files(
  in_folder: string,
  out_folder: string,
  callback: ((data: any) => any) | null
) {
  // recursively scan the input folder for yaml files
  if (fs.existsSync(out_folder)) {
    fs.rmSync(out_folder, { recursive: true, force: true });
  }
  fs.mkdirSync(out_folder, { recursive: true });

  const files = walk_files(in_folder);
  for (let file of files) {
    if (!file.endsWith('.yaml')) return;
    const content = fs.readFileSync(file, 'utf8');
    let data = yaml.load(content);
    if (callback) data = callback(data);
    const json_file = file.replace(in_folder, out_folder).replace('.yaml', '.json');
    const json_folder = path.dirname(json_file);
    if (!fs.existsSync(json_folder)) {
      fs.mkdirSync(json_folder, { recursive: true });
    }
    fs.writeFileSync(json_file, JSON.stringify(data, null, 2));
  }
}

/**
 * Vite plugin to build json files from the yaml files for use in production
 * @param inputFolder The folder containing the yaml files
 * @param outputFolder The folder where the json files will be generated
 */
export const build_json_files = (
  inputFolder: string,
  outputFolder: string,
  customMiddleware: ((data: any) => any) | null = null
) => {
  return {
    name: 'build json files',
    async buildStart() {
      await _build_json_files(inputFolder, outputFolder, customMiddleware);
    }
  } as PluginOption;
};
