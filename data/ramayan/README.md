# श्रीमद्रामायणस्य Data Extraction and Transliteration

This is a extarct to scape data from [विकिस्रोत](https://sa.wikisource.org/wiki/%E0%A4%B5%E0%A4%BE%E0%A4%B2%E0%A5%8D%E0%A4%AE%E0%A5%80%E0%A4%95%E0%A4%BF%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%AF%E0%A4%A3%E0%A4%AE%E0%A5%8D) and extract from and standardize it both using mannual and automated processes.

## Data Scraping

We scape data from the main vikisrot page of the Ramayana and then from each of the kandas. We then extract the text from each of the shlokas, and store it in text_data folder.

## Standardization

We try to automate the process of standardization of the text to the extent possible, but after we have to mannually correct the text.

### Making Mannual Corrections

So before we start on how to correct manually, we need to understand that how it scans the text to extarct the actual shloka. Lets Take the shloka below as an example.

```text
कुशचीरपरिक्षिप्तं ब्राह्म्या लक्ष्म्या समावृतम्।
यथा प्रदीप्तं दुर्दर्शं गगने सूर्यमण्डलम्॥ २॥
```

- We start with shloka and consider it the same line(not shloka) untill we get to `।`
  - > Note :- Only Devanagari akSharas(not even numbers) are included in the final shloka, so any other text is ommited.
- After encountering `।` we add a new line.
- The same same repeats untill `॥` is encountered. When we get `॥` we end the shloka there.
- The shloka numbering is inconsistent, so it is not taken into consideration. And we rather do it programmatically.

### **Things to keep in mind while correcting the text**

- The most important point is that `।` and `॥` should be present correctly. As they are the deciding factor for the shloka.
  - `।` is used to end the line. if it missing new line will not be created.
  - `॥` is used to end the shloka. If it is missing the shloka will end.
- You also do not need to worry about the numbering of the shlokas, as it is done programmatically. Just make sure that `॥` is present at the end of the shloka.
- The starting and ending text does not needs taken care of as they will be ignored and rather added promgrammatically to the final output.(`श्रीमद्वाल्मीकीयरामायणे बालकाण्डे` and `इत्यार्षे श्रीमद्रामायणे वाल्मीकीये आदिकाव्ये` lines)
- Do not make any changes to spacing before ॥ and ।, as they are ignored and added programmatically.

### Recording Manuall Corrections

We also recommend that you add the corrections you make to [Manual_Changes.md](./Manual_Changes.md) file, so that we can keep track of the changes made.
Example change text

> :warning: You shoould know `markdown` in order to make changes to the file.

```text
`1-1-100` line 3 change ॥ to ।
`1-3-(24-39)` added । at the end of the line.
```
