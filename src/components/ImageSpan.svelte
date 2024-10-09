<script lang="ts">
  import { cl_join } from '~/tools/cl_join';
  let className = '';
  export { className as class };
  export let src: string;
</script>

<span class={cl_join('inline-block bg-cover', className)} style:background-image={`url(${src})`} />
