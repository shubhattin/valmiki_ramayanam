<script lang="ts">
  import { client } from '@api/client';
  import { storeAuthInfo } from '@tools/auth_tools';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { delay } from '@tools/delay';
  import { cl_join } from '@tools/cl_join';
  import Icon from '@tools/Icon.svelte';
  import { BiLogIn } from 'svelte-icons-pack/bi';

  export let on_verify: (verified: boolean, id_token: string, access_token: string) => void = null!;
  export let is_verified: Writable<boolean>;
  export let show_always = false;
  let pass_input_element: Writable<HTMLInputElement> = writable(null!);

  export let user_input_element: Writable<HTMLInputElement> = writable(null!);

  let username_or_email: string;
  let password: string;
  let pass_input_spinner_show = false;
  let wrong_pass_status = false;
  let user_not_found_status = false;

  const check_pass = async () => {
    if (password === '') return;
    pass_input_spinner_show = true;
    const res = await client.auth.verify_pass.query({
      username_or_email: username_or_email,
      password: password
    });
    await delay(500);
    pass_input_spinner_show = false;
    user_not_found_status = false;
    wrong_pass_status = false;
    if (!res.verified) {
      if (res.err_code === 'user_not_found') {
        username_or_email = '';
        $user_input_element.focus();
        user_not_found_status = true;
      } else if (res.err_code === 'wrong_password') {
        password = '';
        $pass_input_element.focus();
        wrong_pass_status = true;
      }
    } else {
      $is_verified = true;
      storeAuthInfo(res);
      if (on_verify) on_verify($is_verified, res.id_token, res.access_token);
    }
  };
</script>

{#if show_always || !$is_verified}
  <div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Authentication</div>
  <form on:submit|preventDefault={check_pass} class="mt-2 space-y-2.5">
    <label class="space-y-1">
      <div class="space-x-3 font-bold">
        <span class="font-bold">Username/Email</span>
        {#if user_not_found_status}
          <span class="text-red-600 dark:text-red-500">User not found</span>
        {/if}
      </div>
      <input
        name="username"
        type="text"
        bind:this={$user_input_element}
        bind:value={username_or_email}
        required
        class="input variant-form-material"
        placeholder="Username"
      />
    </label>
    <label class="space-y-1">
      <span class="font-bold">Password</span>
      <input
        name="password"
        class={cl_join('input variant-form-material', wrong_pass_status && 'input-error')}
        type="password"
        placeholder="Password"
        bind:value={password}
        required
        bind:this={$pass_input_element}
      />
    </label>
    <button
      type="submit"
      class="btn rounded-lg bg-primary-700 p-0 py-1 pr-2 font-bold text-white"
      disabled={pass_input_spinner_show}
    >
      <Icon src={BiLogIn} class="text-3xl" />
      <span>Login</span>
    </button>
  </form>
{/if}
