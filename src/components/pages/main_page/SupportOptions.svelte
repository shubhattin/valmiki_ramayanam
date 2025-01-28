<script lang="ts">
  import { PatreonIcon, PayPalIcon, RazorpayIcon, UPIIcon, YoutubeIcon } from '~/components/icons';
  import Icon from '~/tools/Icon.svelte';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';
  import ImageSpan from '~/components/ImageSpan.svelte';

  const UPI_ID = 'thesanskritchannel@okicici';
  const UPI_ID_LINK = (() => {
    const name = encodeURIComponent('The Sanskrit Channel');
    return `upi://pay?pa=${UPI_ID}&pn=${name}&cu=INR`;
  })();
  let qr_canvas: HTMLCanvasElement | null = $state(null);
  let darkColor = '#000000';
  let lightColor = '#ffffff';
  const CANVAS_SIZE = $state(146);

  onMount(() => {
    QRCode.toCanvas(qr_canvas!, UPI_ID_LINK, {
      width: CANVAS_SIZE,
      margin: 1.2,
      color: {
        dark: darkColor,
        light: lightColor
      }
    });
  });
</script>

<div class="mb-2.5 text-center text-lg font-bold text-amber-700 dark:text-warning-500">
  <div>Support Our Projects</div>
  <div class="text-sm">Pay as you wish</div>
</div>

<div class="text-sm font-semibold underline">One-Time Contributions :</div>
<div class="mt-2">
  <div class="flex justify-center text-center text-sm">
    <a href={UPI_ID_LINK} target="_blank" class="ml-1 select-none" rel="noopener noreferrer">
      <Icon src={UPIIcon} class="-mt-1.5 text-3xl" /> UPI :
      <span
        class="text-sm text-blue-600 outline-none hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >{UPI_ID}</span
      ></a
    >
  </div>
  <div class="flex justify-center">
    <canvas
      bind:this={qr_canvas}
      class="block h-auto w-full"
      height={CANVAS_SIZE}
      width={CANVAS_SIZE}
    ></canvas>
    <div
      style="width: {CANVAS_SIZE}px; height: {CANVAS_SIZE}px;"
      class="absolute flex items-center justify-center"
    >
      <ImageSpan src="/img/tcs_64.png" class="h-10 w-10 rounded-full bg-white p-1 shadow-md" />
    </div>
  </div>
  <div class="mt-0 space-y-1">
    <a
      href="https://pages.razorpay.com/thesanskritchannel"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center"
      title="Support us on Razorpay"
    >
      <Icon src={RazorpayIcon} class="-my-12 -mt-3 text-7xl" />
      <span
        class="ml-1 mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >rzp.com/thesanskritchannel</span
      >
    </a>
    <a
      href="https://www.paypal.me/thesanskritchannel"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center"
      title="Support us on Paypal"
    >
      <Icon src={PayPalIcon} class="-mt-3 text-2xl" />
      <span
        class="ml-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >paypal.me/thesanskritchannel</span
      >
    </a>
  </div>
</div>

<div class="mt-4 text-sm font-semibold underline">Monthly Memberships :</div>
<div class="mt-[0.2rem] space-y-1">
  <a
    href="https://www.patreon.com/thesanskritchannel"
    target="_blank"
    class="flex items-center justify-center space-x-2.5 pt-1"
    title="Support us on Patreon"
  >
    <Icon src={PatreonIcon} class="-mt-1 inline-block text-xl dark:bg-white" />
    <span
      class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >Join on Patreon</span
    >
  </a>
  <a
    href="https://www.youtube.com/channel/UCqFg6QnwgtVHo1iFgpxrx-A/join"
    target="_blank"
    title="Support us on Youtube"
    class="flex items-center justify-center space-x-2"
  >
    <Icon src={YoutubeIcon} class="text-2xl text-[red]" />
    <span
      class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >Join on YouTube</span
    >
  </a>
</div>
