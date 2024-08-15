# श्रीमद्रामायणस्य Data Extraction and Transliteration

This is a extarct to scape data from [विकिस्रोत](https://sa.wikisource.org/wiki/रामायणम्) and extract from and standardize it both using mannual and automated processes.

[![Ramayan CI](https://github.com/shubhattin/sanskrit_text_transliteration/actions/workflows/ramayan_ci.yml/badge.svg)](https://github.com/shubhattin/sanskrit_text_transliteration/actions/workflows/ramayan_ci.yml)

## Data Scraping

We [scape data](./get_raw_data.py) from the main vikisrot page of the Ramayana and then from each of the kandas. We then [extract text](./get_text.py) from each of the shlokas, and store it in [text_data](./text_data/) folder. Also we [process](./get_json.py) it further to generate the json data which is stored in the [data](./data/) folder, which is the main final output.
Altough the raw data extraction steps is done only once while initializing the project(so need for step anymore), the text extraction and json generation can be done multiple times(necessarily after manual changes).

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

#### Other

- Steps to start contributing
  - Make sure you have a [github](https://github.com/signup) account.
  - Fork the [repository](https://github.com/shubhattin/sanskrit_text_transliteration) to your account.
  - Goto the forked repository and press `.(dot)` key on keyboard. This will open the github.dev environment.
  - You can start editing the files in the text_data folder.
  - In the left side you should see the git icon, click on it and you should see the changes you have made.
  - Add a commit message and press the tick mark to commit the changes.
  - Go Back to the forked repository and press `Contribute > Open Pull Request` button to create a pull request.
  - Notify me somehow if you can, after opening PR so I am notified.
  - After the PR has been merged, the changes will be reflected in the main repository.
  - If you again need to make some changes, then before make sure to sync the changes from main repo by clicking on Sync Button.
- After you have commited and pushed the changes in Github Codespace or on github.dev, you should be able to see the test results for your latest commit py pressing on the `Actions` tab and then on the `Ramayan CI` workflow. You can also see the results of the test by clicking on the `Ramayan CI` badge above also.

### **_Files to change_**

- **Text Data** : It is stored in the [text_data](./text_data/) folder. The manual changes to be made shall be done in this folder. The folder format for files is `kANDa_number/sarga_number.txt`.
- **JSON Data** : No change should be direct made to **_[data](./data/)_** folder as it contains json data which is build output generated from the text_data folder. So if the text_data is correctly changed output should also be correct.
- **Normally** if you are submitiing any changes to the text_data folder, you need not worry about generating the json output as it will be done by me when i merge the changes.

### Recording Manuall Corrections

We also recommend that you add the corrections you make to [Manual_Changes.md](./Manual_Changes.md) file, so that we can keep track of the changes made.
Example change text.

> :warning: You shoould know `markdown` in order to make changes to the file.

```markdown
`1-1-100` line 3 change ॥ to ।
`1-3-(24-39)` added । at the end of the line.
```
