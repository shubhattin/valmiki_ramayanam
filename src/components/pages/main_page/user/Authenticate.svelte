<script lang="ts">
  import { client_q } from '~/api/client';
  import { storeAuthInfo } from '~/tools/auth_tools';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { cl_join } from '~/tools/cl_join';
  import Icon from '~/tools/Icon.svelte';
  import { BiLogIn } from 'svelte-icons-pack/bi';

  let pass_input_element = $state<HTMLInputElement>(null!);

  interface Props {
    on_verify?: (verified: boolean, id_token: string, access_token: string) => void;
    is_verified: Writable<boolean>;
    show_always?: boolean;
    user_input_element?: Writable<HTMLInputElement>;
  }

  let {
    on_verify = null!,
    is_verified,
    show_always = false,
    user_input_element = writable(null!)
  }: Props = $props();

  let username_or_email = $state('');
  let password = $state('');
  let wrong_pass_status = $state(false);
  let user_not_found_status = $state(false);

  const check_pass = client_q.auth.verify_pass.mutation({
    onSuccess(res) {
      user_not_found_status = false;
      wrong_pass_status = false;
      if (!res.verified) {
        if (res.err_code === 'user_not_found') {
          username_or_email = '';
          $user_input_element.focus();
          user_not_found_status = true;
        } else if (res.err_code === 'wrong_password') {
          password = '';
          pass_input_element.focus();
          wrong_pass_status = true;
        }
      } else {
        $is_verified = true;
        storeAuthInfo(res);
        if (on_verify) on_verify($is_verified, res.id_token, res.access_token);
      }
    }
  });
  const check_pass_func = async (e: Event) => {
    e.preventDefault();
    if (password === '') return;
    $check_pass.mutate({
      username_or_email: username_or_email,
      password: password
    });
  };
</script>

{#if show_always || !$is_verified}
  <div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Authentication</div>
  <form onsubmit={check_pass_func} class="mt-2 space-y-2.5">
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
        minlength={6}
        placeholder="Password"
        bind:value={password}
        required
        bind:this={pass_input_element}
      />
    </label>
    <button
      type="submit"
      class="btn rounded-lg bg-primary-700 p-0 py-1 pr-2 font-bold text-white"
      disabled={$check_pass.isPending}
    >
      <Icon src={BiLogIn} class="text-3xl" />
      <span>Login</span>
    </button>
  </form>
{/if}
