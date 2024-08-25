export const download_file_in_browser = (
  link: string,
  name: string,
  revoke_url_after_download = false
) => {
  const a = document.createElement('a');
  a.href = link;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (revoke_url_after_download) URL.revokeObjectURL(link);
};
