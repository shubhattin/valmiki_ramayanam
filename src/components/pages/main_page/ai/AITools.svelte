<script lang="ts">
  import ImageGenerator from './AIImageGenerator.svelte';
  // import { Tab, TabGroup } from '@skeletonlabs/skeleton';

  // let tab_set: 'image' = 'image';
</script>

<!-- <TabGroup>
  <Tab bind:group={tab_set} name="tab3" value={'image'}>Image Generator</Tab>
  <svelte:fragment slot="panel">
    {#if tab_set === 'image'}
      ImageGenerator
    {/if}
  </svelte:fragment>
</TabGroup> -->
<ImageGenerator />
