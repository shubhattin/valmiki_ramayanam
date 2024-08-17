import { describe, expect, it } from 'vitest';
import yaml from 'js-yaml';
import * as fs from 'fs';
import LipiLekhikA from '../tools/converter';

const LANG_LIST = ['de', 'te', 'kn', 'ta', 'bn', 'or', 'gu', 'ml'];

describe('Basic Conversions', () => {
	it('Convert from Devanagari to Other scripts', async () => {
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
	const dev_to_normal_texts = [
		['प्रपञ्च रपञ्च', 'prapancha rapancha'],
		// remove .. and . tesr
		// kavarga patch test
		['कङ्का', 'kankA'],
		['बङ्खा', 'bankhA'],
		['छङ्गो', 'ChangO'],
		['किङ्घू', 'kinghU'],
		// chavaraga patch test, also chh to Ch test
		['चञ्चल', 'chanchala'],
		['कञ्छी', 'kanChI'],
		['भञ्जनकरं', 'bhanjanakaraM'],
		['प्रबलञ्झ', 'prabalanjha'],
		['प्रतिज्ञा', 'pratijnA']
	];
	it('From Devanagari to Normal', async () => {
		const SOURCE_LANG = 'Sanskrit';
		const TARGET_LANG = 'Normal';
		await LipiLekhikA.k.load_lang('Sanskrit');
		const TESTS = [...dev_to_normal_texts, ['केवलैकम् ।२- ॥१-२-३॥', 'kEvalaikam 2- 1-2-3']];
		for (let data of TESTS) {
			const dev_text = data[0];
			const expected = data[1];
			const out_data = LipiLekhikA.convert(dev_text, SOURCE_LANG, TARGET_LANG);
			expect(out_data).toBe(expected);
		}
	});
	it('From Normal to Devanagari', async () => {
		const SOURCE_LANG = 'Normal';
		const TARGET_LANG = 'Sanskrit';
		await LipiLekhikA.k.load_lang('Sanskrit');
		for (let data of dev_to_normal_texts) {
			const normal_text = data[1];
			const expected = data[0];
			const out_data = LipiLekhikA.convert(normal_text, SOURCE_LANG, TARGET_LANG);
			expect(out_data).toBe(expected);
		}
	});
});
