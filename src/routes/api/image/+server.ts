import type { RequestHandler } from './$types';
import { Configuration, OpenAIApi, type ResponseTypes } from 'openai-edge';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

const config = new Configuration({
  apiKey: env.OPENAI_API_KEY
});

const openai = new OpenAIApi(config);

export const POST: RequestHandler = async ({ request }) => {
  const { image_prompt } = z
    .object({
      image_prompt: z.string()
    })
    .parse(await request.json());

  const response = await openai.createImage({
    prompt: image_prompt,
    size: '512x512',
    response_format: 'url'
  });

  const data = (await response.json()) as ResponseTypes['createImage'];

  const url = data.data?.[0]?.url;
  return new Response(url, { status: 200 });
};
