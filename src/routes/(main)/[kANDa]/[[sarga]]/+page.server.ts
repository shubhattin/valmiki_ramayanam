import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import rAmayaNa_map from '@data/ramayan/ramayan_map.json';

export const load: PageServerLoad = async ({ params }) => {
  const params_schema = z.object({
    kANDa: z.coerce.number().int().min(1).max(rAmayaNa_map.length),
    sarga: z.coerce.number().int().optional()
  });
  const params_data = params_schema.safeParse(params);

  if (!params_data.success) {
    error(404, {
      message: `kANDa '${params.kANDa}' not found`
    });
  }
  const { kANDa, sarga } = params_data.data;
  if (sarga) {
    const sarga_count = rAmayaNa_map[kANDa - 1].sarga_count;
    if (!(sarga >= 1 && sarga <= sarga_count)) {
      error(404, {
        message: `Sarga '${sarga}' not found in Kanda ${kANDa}`
      });
    }
  }
};
