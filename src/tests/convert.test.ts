import { describe, expect, it } from 'vitest';
import { lipi_parivartak_async } from '../tools/converter';

describe('Test Custom Patches on Normal <-> Devangari Texts', () => {
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
    const TESTS = [...dev_to_normal_texts, ['केवलैकम् ।२- ॥१-२-३॥', 'kEvalaikam 2- 1-2-3']];
    for (let data of TESTS) {
      const dev_text = data[0];
      const expected = data[1];
      const out_data = await lipi_parivartak_async(dev_text, SOURCE_LANG, TARGET_LANG);
      expect(out_data).toBe(expected);
    }
  });
  it('From Normal to Devanagari', async () => {
    const SOURCE_LANG = 'Normal';
    const TARGET_LANG = 'Sanskrit';
    for (let data of dev_to_normal_texts) {
      const normal_text = data[1];
      const expected = data[0];
      const out_data = await lipi_parivartak_async(normal_text, SOURCE_LANG, TARGET_LANG);
      expect(out_data).toBe(expected);
    }
  });
});

describe('Test anunAsika', () => {
  const LANGS_TO_TEST = ['Telugu', 'Kannada'];
  const TESTS = [
    ['सर्वान्को', 'सर्वान्को'],
    ['भवान्चापि', 'भवान्चापि'],
    ['सर्वम्को', 'सर्वम्को'],
    ['भुजङ्ग', 'भुजंग'],
    ['विरिञ्चि', 'विरिंचि'],
    ['काण्डे', 'कांडे'],
    ['दन्तवर्धन', 'दंतवर्धन'],
    ['कम्पन', 'कंपन']
  ];

  it('Test anunAsika', async () => {
    for (let lang of LANGS_TO_TEST) {
      const SOURCE_LANG = 'Sanskrit';
      const TARGET_LANG = lang;
      for (let data of TESTS) {
        const out_data_1 = await lipi_parivartak_async(data[0], SOURCE_LANG, TARGET_LANG);
        const out_data_2 = await lipi_parivartak_async(data[1], SOURCE_LANG, TARGET_LANG);
        expect(out_data_1).toBe(out_data_2);
      }
    }
  });
});
