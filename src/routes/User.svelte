<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import { client } from '@api/client';
  import { popup } from '@skeletonlabs/skeleton';
  import { TrOutlineLogin2 } from 'svelte-icons-pack/tr';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
</script>

<button
  class="btn m-2 p-0"
  use:popup={{
    event: 'click',
    target: 'user_info',
    placement: 'left-start'
  }}
>
  <Icon class="hover:text-gray-6200 text-3xl dark:hover:text-gray-400" src={VscAccount} />
</button>
<div class="card z-40 px-1 py-2 shadow-2xl" data-popup="user_info">
  <div class="space-y-2">
    <button
      class="text-md flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Icon src={TrOutlineLogin2} class="-ml-1 text-3xl" />
      <span>Login</span>
    </button>
    <button
      class="text-md flex w-full space-x-2 rounded-md px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Icon src={LuUserPlus} class="text-3xl" />
      <span>Signup</span>
    </button>
  </div>
</div>
