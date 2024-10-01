import { z } from 'zod';
import { env } from '$env/dynamic/public';

export async function loadLocalConfig() {
  const config_schema = z.object({
    image_tool_opened: z.boolean().optional(),
    view_translation_status: z.boolean().optional(),
    trans_lang: z.string().optional(),
    editing_status_on: z.boolean().optional(),
    ai_tool_opened: z.boolean().optional()
  });
  let config: z.infer<typeof config_schema> = {};
  if (env.PUBLIC_LOCAL_CONFIG === 'true') {
    try {
      const url = new URL('/src/components/pages/main_page/local_config.json', import.meta.url)
        .href;
      const request = await fetch(url);
      const data = await request.json();
      config = config_schema.parse(data);
    } catch (e) {}
  }

  return config;
}
