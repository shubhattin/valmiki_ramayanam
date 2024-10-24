<script lang="ts">
  import { cl_join } from '~/tools/cl_join';
  
  interface Props {
    class?: string;
    src: string;
  }

  let { class: className = '', src }: Props = $props();
</script>

<span class={cl_join('inline-block bg-cover', className)} style:background-image={`url(${src})`}></span>
