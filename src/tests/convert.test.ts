import { describe, expect, it } from 'vitest';
import yaml from 'js-yaml';
import * as fs from 'fs';
import LipiLekhikA from '../tools/converter';

const LANG_LIST = ['de', 'te', 'kn', 'ta', 'bn', 'or', 'gu', 'ml'];

describe('Basic Conversions', () => {
	it('convert from devanagari to other scripts', async () => {
		const list = yaml.load(fs.readFileSync('./src/tests/data/tests.yml', 'utf-8')) as Record<
			string,
			string
		>[];

		for (let lang of LANG_LIST) {
			await LipiLekhikA.k.load_lang(lang);
		}
		for (let data of list) {
			const main_data = data['de'];
			for (let lang in data) {
				if (lang === 'de') continue;
				const expected = data[lang];
				const out_data = LipiLekhikA.convert(main_data, 'de', lang);
				expect(out_data).toBe(expected);
			}
		}
	});
});

describe('Test Custom Patches', () => {
	it('From Devanagari to Normaal', async () => {
		//
	});
});
