<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { cl_join } from '~/tools/cl_join';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import Icon from '~/tools/Icon.svelte';
  import { client_q } from '~/api/client';
  import { z } from 'zod';

  interface Props {
    on_verify?: () => void;
    name_input_element: Writable<HTMLInputElement>;
  }

  let { on_verify = null!, name_input_element }: Props = $props();
  let username_input_element: HTMLInputElement = $state(null!);
  let email_input_element: HTMLInputElement = $state(null!);

  let username = $state('');
  let name = $state('');
  let password = $state('');
  let email = $state('');
  let contact_number = $state('');

  let user_already_exists = $state(false);
  let email_already_exists = $state(false);

  let user_created_status = $state(false);

  const create_new_user = client_q.auth.add_new_user.mutation({
    onSuccess(res) {
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
      contact_number: contact_number
    });
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Create New User</div>
{#if user_created_status}
  <div class="mt-2 space-y-2">
    <div class="font-bold text-green-600 dark:text-green-500">User created successfully</div>
    <div>
      But your account is not yet activated to make changes to Translations. Also you have not been
      assigned any language to work upon. Please contact the admin to activate your account and
      assign you language(s).
    </div>
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
      <div class="space-x-3 font-bold">
        <span>Name</span>
      </div>
      <input
        name="name"
        type="text"
        bind:value={name}
        bind:this={$name_input_element}
        minlength={4}
        maxlength={50}
        required
        class="input variant-form-material"
        placeholder="Name"
      />
    </label>
    <label class="space-y-1">
      <div class="space-x-3 font-bold">
        <span>Username</span>
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
        <span>Email</span>
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
      <span class="font-bold">Password</span>
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
