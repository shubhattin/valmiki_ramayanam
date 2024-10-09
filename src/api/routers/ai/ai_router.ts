import { t } from '~/api/trpc_init';
import { get_generated_images_router } from './generate_image';
import { get_image_prompt_router } from './get_image_prompt';

export const ai_router = t.router({
  get_image_prompt: get_image_prompt_router,
  get_generated_images: get_generated_images_router
});
