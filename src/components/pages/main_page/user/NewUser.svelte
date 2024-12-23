<script lang="ts">
  import { cl_join } from '~/tools/cl_join';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import Icon from '~/tools/Icon.svelte';
  import { client_q, client } from '~/api/client';
  import { z } from 'zod';
  import { get_id_token_info, storeAuthInfo } from '~/tools/auth_tools';
  import { user_info } from '~/state/main_page/user';
  import OtpVerification from './OTPVerification.svelte';

  interface Props {
    on_verify?: () => void;
    name_input_element: HTMLInputElement;
  }

  let { on_verify = null!, name_input_element = $bindable() }: Props = $props();
  let username_input_element: HTMLInputElement = $state(null!);
  let email_input_element: HTMLInputElement = $state(null!);

  let username = $state('');
  let name = $state('');
  let password = $state('');
  let email = $state('');
  let contact_number = $state('');
  let auto_login = $state(true);

  let user_already_exists = $state(false);
  let email_already_exists = $state(false);

  let user_created_status = $state(false);

  const create_new_user = client_q.user.add_new_user.mutation({
    async onSuccess(res) {
      user_already_exists = false;
      email_already_exists = false;
      if (!res.success) {
        if (res.status_code === 'user_already_exist') {
          username = '';
          username_input_element.focus();
          user_already_exists = true;
        } else if (res.status_code === 'email_already_exist') {
          email = '';
          email_input_element.focus();
          email_already_exists = true;
        }
      } else {
        user_created_status = true;
        if (auto_login) {
          const user = await client.auth.verify_pass.mutate({
            username_or_email: username,
            password: password
          });
          if (user.verified) {
            storeAuthInfo(user);
            $user_info = get_id_token_info().user;
          }
        }
      }
    }
  });
  const create_new_user_func = async (e: Event) => {
    e.preventDefault();
    if (
      [username, name, password, email].some((v) => !v || v === '') ||
      !z.string().email().safeParse(email).success
    )
      return;
    $create_new_user.mutate({
      email: email,
      password: password,
      username: username,
      name: name,
      contact_number: contact_number !== '' ? contact_number : null
    });
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Create New User</div>
{#if user_created_status}
  <div class="mt-2 space-y-2">
    {#if $create_new_user.isPending}
      <div class="text-lg font-bold text-primary-600 dark:text-primary-500">Creating User...</div>
    {:else if $create_new_user.isSuccess && $create_new_user.data.success}
      <div class="text-lg font-bold text-green-600 dark:text-green-500">
        User created successfully
      </div>
      <div>
        <span class="font-semibold text-warning-500">Your account needs verification.</span> Verify your
        Email Address after Login and then contact the admin to assign you language(s).
      </div>
      <OtpVerification
        id={$create_new_user.data.user_id}
        after_signup={true}
        on_verified={on_verify}
      />
    {:else}
      <div class="text-lg font-bold text-red-600 dark:text-red-500">User creation failed</div>
    {/if}
    <button
      class="variant-outline-primary btn"
      onclick={() => {
        if (on_verify) on_verify();
      }}>Continue</button
    >
  </div>
{:else}
  <form onsubmit={create_new_user_func} class="mt-2 space-y-2.5 text-base">
    <label class="space-y-1">
      <div class="font-bold">
        <span>Name</span>
        <span class="text-red-500">*</span>
      </div>
      <input
        name="name"
        type="text"
        bind:value={name}
        bind:this={name_input_element}
        minlength={4}
        maxlength={50}
        required
        class="input variant-form-material"
        placeholder="Name"
      />
    </label>
    <label class="space-y-1">
      <div class="space-x-3 font-bold">
        <span>Username <span class="text-red-500">*</span></span>
        {#if user_already_exists}
          <span class="text-red-600 dark:text-red-500">Username already exists</span>
        {/if}
      </div>
      <input
        name="username"
        type="text"
        bind:value={username}
        bind:this={username_input_element}
        required
        minlength={3}
        maxlength={25}
        class="input variant-form-material"
        placeholder="Username"
      />
    </label>
    <label class="space-y-1">
      <div class="space-x-3 font-bold">
        <span>Email <span class="text-red-500">*</span></span>
        {#if email_already_exists}
          <span class="text-red-600 dark:text-red-500">Email already exists</span>
        {/if}
      </div>
      <input
        name="email"
        type="email"
        bind:value={email}
        bind:this={email_input_element}
        required
        class="input variant-form-material"
        placeholder="Email"
      />
    </label>
    <label class="space-y-1">
      <span class="font-bold">Password <span class="text-red-500">*</span></span>
      <input
        name="password"
        class={cl_join('input variant-form-material')}
        type="password"
        minlength={6}
        placeholder="Password"
        bind:value={password}
        required
      />
    </label>
    <label class="space-y-1">
      <span>Contact Number</span>
      <input
        name="contact_number"
        type="tel"
        minlength={10}
        maxlength={17}
        bind:value={contact_number}
        class="input variant-form-material"
        placeholder="Contact Number (Optional)"
      />
    </label>
    <label class="text-sm">
      <input type="checkbox" bind:checked={auto_login} class="checkbox" />
      Auto Login after Signup
    </label>
    <button
      type="submit"
      class="btn rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
      disabled={$create_new_user.isPending}
    >
      <Icon src={LuUserPlus} class="text-2xl" />
      <span>Signup</span>
    </button>
  </form>
{/if}
