# Technical Details

[![Ramayan CI](https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/ramayan_ci.yml/badge.svg)](https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/ramayan_ci.yml)
[![App Checks](https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/app_checks.yml/badge.svg)](https://github.com/shubhattin/valmiki_ramayanam/actions/workflows/app_checks.yml)

## Tech Stack

### **Frontend**

- **JS Framework**: [SvelteKit](https://kit.svelte.dev/) meta framework for [Svelte](https://svelte.dev/), also using [TypeScript](https://www.typescriptlang.org/)
- **Design and Components**: [TailwindCSS](https://tailwindcss.com/) along with [Skeleton UI](https://www.skeleton.dev/)
- **Query Helper** : [Tanstack Query](https://tanstack.com/query/latest) for fetching and managing asynchronous data.

### **Backend**

- **API**: [trpc](https://trpc.io/) for API
- **Database** : [PostgreSQL](https://www.postgresql.org/) hosted on [NeonDB](https://neon.tech/) and with [Drizzle](https://orm.drizzle.team/) for ORM.
- **Authentication** : Using Auth Server of [BetterAuth](https://www.better-auth.com/) in [tsc_users](https://github.com/shubhattin/tsc-users) repository.
- **Hosting Provider** : [Vercel](https://vercel.com/) for hosting our website and API. As currently our backend is Edge Compatible so we are using Vercel Edge Functions for API.

## Data Processing

- _Transliteration_: [Lipi Lekhika](https://app-lipilekhika.pages.dev/)
- _Data Source_: [Valmiki Ramayanam - Wikisource](https://sa.wikisource.org/wiki/रामायणम्)
- Scripts Associated the tasks in `data/ramaayana/`:
  - `get_raw_data.py`: Fetches the data from the Wikisource and stores it in `data/ramaayana/raw_data/`. It prefers to fetch the data from the [cached zip](https://github.com/shubhattin/valmiki_ramayanam/releases/download/raw_data/raw_data.7z) instead also of directly fetching from the Wikisource(as the source might be edited which would cause inconsitent results).
  - `get_text.py`: Processes the raw data and stores the text in `data/ramaayana/text_data/`.
  - `get_json.py`: Processes the text data and stores the JSON in `data/ramaayana/data/`.
  - `make_excel_files.ts`: Processes the JSON data and stores the Excel files in `data/ramaayana/out/`.
  - `run_tests.py`: Runs the tests on the JSON data, and saves the generated test result in `data/ramayan/test_out.md`.
- [Raw Data Cached Zip of Extarcted HTML](https://github.com/shubhattin/valmiki_ramayanam/releases/download/raw_data/raw_data.7z) on [raw data release](https://github.com/shubhattin/valmiki_ramayanam/releases/tag/raw_data)

### Shloka Image Generation

- These are the images generated for automating the processs of which would have been done manually with photoshop.
- [FabricJS](https://fabricjs.com/) is used to render the elements on the canvas. Scaling and positioning of the elements is done manually via custom formulas.
- As the native `Text` object had problems rendering indic text properly on the canvas we had to to use wasm version of [harfbuzz](https://github.com/harfbuzz/harfbuzz).
- The harfbuzzjs library was not directlt usable in the browser. So I had to modify it from the example in [https://harfbuzz.github.io/harfbuzzjs/](https://harfbuzz.github.io/harfbuzzjs/) to work with vite in browser and also nake it compatible with Web Workers API.

### AI Imaage Generation and AI Shloka Translation

- We are using [OpenAI](https://openai.com/) and [Anthropic](https://www.anthropic.com/) for the AI image generation and translation.
- **Image**
  - First we generate the image prompt using shloka text and available english translation. using `gpt-4o` and `claude-3.7-sonnet` model.
  - Then finally we use `dall-e-3` model to generate the image.
- **Shloka Translation**
  - We use `gpt-4o` and `claude-3.7-sonnet` model to translate the text.
  - The entire shloka text is provided along with the translation to generate English and Indian language translations.
