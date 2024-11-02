import { t } from '~/api/trpc_init';
import { get_generated_images_route } from './generate_image';
import { get_image_prompt_route } from './get_image_prompt';
import { translate_sarga_route } from './translate_sarga';

export const ai_router = t.router({
  get_image_prompt: get_image_prompt_route,
  get_generated_images: get_generated_images_route,
  translate_sarga: translate_sarga_route
});
