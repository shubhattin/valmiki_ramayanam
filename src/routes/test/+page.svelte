<script lang="ts">
  import { ACCESS_ID, get_access_token_info } from '@tools/auth_tools';
  import { download_file_in_browser } from '@tools/download_file_browser';
  import { fetch_get } from '@tools/fetch';

  const download = async () => {
    // get the host url
    const origin = window.location.origin;
    const req = await fetch_get('/api/stream_file', {
      params: {
        file_url: `https://oaidalleapiprodscus.blob.core.windows.net/private/org-HI4SfyTKbmuu6S3k3usuXndD/user-pfaiafz79o4tArNXucScbKlc/img-aTUrW4Gy27brtPzV56pA7wZB.png?st=2024-10-06T05%3A46%3A21Z&se=2024-10-06T07%3A46%3A21Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-10-05T23%3A26%3A28Z&ske=2024-10-06T23%3A26%3A28Z&sks=b&skv=2024-08-04&sig=CEyegD60qMCCYpXF1EfeDaHWT3kiRii09YHI%2ByknK88%3D`
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem(ACCESS_ID)
      }
    });
    const resp = await req.blob();
    const url = window.URL.createObjectURL(resp);
    download_file_in_browser(url, 'sample_image_1.png', true);
  };
</script>

<button on:click={download}>Download</button>
