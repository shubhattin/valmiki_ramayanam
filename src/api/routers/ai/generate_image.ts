import { protectedAdminProcedure, t } from '@api/trpc_init';
import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { ai_sample_data } from './sample_data/sample_data';
import { delay } from '@tools/delay';
import { fetch_post } from '@tools/fetch';
import type OpenAI from 'openai';

type image_format_type = 'url' | 'b64_json';
const IMADE_OUT_MODE = 'url' as image_format_type;
export const get_generated_images_router = protectedAdminProcedure
  .input(
    z.object({
      image_prompt: z.string(),
      number_of_images: z.number().int().min(1).max(4),
      use_sample_data: z.boolean().optional().default(false)
    })
  )
  .mutation(async ({ input: { image_prompt, number_of_images, use_sample_data } }) => {
    const get_single_image = async () => {
      try {
        // getting some unexpected errors while using the `openai` npm module so using HTTP API instead
        const req = await fetch_post('https://api.openai.com/v1/images/generations', {
          json: {
            model: 'dall-e-3',
            prompt: image_prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: IMADE_OUT_MODE
          } as OpenAI.Images.ImageGenerateParams,
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`
          }
        });
        if (!req.ok) throw new Error('Failed to fetch image');
        const raw_resp = (await req.json()) as OpenAI.Images.ImagesResponse;
        // console.log(raw_resp);
        if (IMADE_OUT_MODE === 'b64_json') {
          // when returned as base64 JSON
          const resp = z
            .object({
              created: z.number().int(),
              data: z
                .object({
                  revised_prompt: z.string(),
                  b64_json: z.string()
                })
                .array()
            })
            .parse(raw_resp);

          return {
            created: resp.created,
            revised_prompt: resp.data[0].revised_prompt!,
            url: `data:image/png;base64,${resp.data[0].b64_json}`
          };
        }
        // when returned as plain URL
        const resp = z
          .object({
            created: z.number().int(),
            data: z
              .object({
                revised_prompt: z.string(),
                url: z.string()
              })
              .array()
          })
          .parse(raw_resp);

        return {
          created: resp.created,
          revised_prompt: resp.data[0].revised_prompt!,
          url: resp.data[0].url
        };
      } catch (e) {
        return null;
      }
    };
    if (use_sample_data) {
      await delay(2000);
      const list: Awaited<ReturnType<typeof get_single_image>>[] = [];
      for (let i = 0; i < number_of_images; i++)
        list.push({
          url: ai_sample_data.sample_images[i],
          created: 0,
          revised_prompt: `Sample Image ${i + 1}`
        });
      return list;
    }
    const requests: ReturnType<typeof get_single_image>[] = [];
    for (let i = 0; i < number_of_images; i++) requests.push(get_single_image());
    const responses = await Promise.all(requests);
    return responses;
  });
