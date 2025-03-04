import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get_seesion_from_cookie } from '~/api/context';
import { z } from 'zod';
import ms from 'ms';

export const GET: RequestHandler = async ({ url, request }) => {
  const session = await get_seesion_from_cookie(request.headers.get('Cookie')!);
  const user = session?.user;
  if (!user || user.role !== 'admin') {
    throw error(401, 'UNAUTHORIZED');
  }

  const fileUrlParam = url.searchParams.get('file_url');
  if (!fileUrlParam) {
    throw error(400, 'Missing "file_url" query parameter');
  }
  let file_url: string;
  try {
    file_url = z.string().url().parse(fileUrlParam);
  } catch (e) {
    throw error(400, 'Invalid "file_url" provided');
  }

  try {
    const fetchResponse = await fetch(file_url);
    if (!fetchResponse.ok) {
      throw error(fetchResponse.status, `Failed to fetch the file: ${fetchResponse.statusText}`);
    }
    const contentType = fetchResponse.headers.get('content-type') || 'application/octet-stream';

    let filename = 'file';

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': `public, max-age=${ms('100mins')}`
    });

    // Stream the fetched file back to the client
    return new Response(fetchResponse.body!, {
      status: 200,
      headers
    });
  } catch (err) {
    throw error(500, 'Internal Server Error while fetching the file.');
  }
};
