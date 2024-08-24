<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { cl_join } from '@tools/cl_join';
  import { LuUserPlus } from 'svelte-icons-pack/lu';
  import Icon from '@tools/Icon.svelte';
  import { client } from '@api/client';
  import { delay } from '@tools/delay';
  import { z } from 'zod';
  export let on_verify: () => void = null!;
  export let name_input_element: Writable<HTMLInputElement>;
  let username_input_element: HTMLInputElement = null!;
  let email_input_element: HTMLInputElement = null!;

  let username: string;
  let name: string;
  let password: string;
  let email: string;
  let contact_number: string;

  let creating_new_user_status = false;
  let user_already_exists = false;
  let email_already_exists = false;

  let user_created_status = false;

  const create_new_user = async () => {
    if (
      [username, name, password, email].some((v) => !v || v === '') ||
      !z.string().email().safeParse(email).success
    )
      return;
    creating_new_user_status = true;
    const res = await client.auth.add_new_user.mutate({
      email: email,
      password: password,
      username: username,
      name: name,
      contact_number: contact_number
    });
    await delay(500);
    creating_new_user_status = false;
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
  };
</script>

<div class="text-2xl font-bold text-orange-600 dark:text-yellow-500">Create New User</div>
{#if user_created_status}
  <div class="mt-2 space-y-2">
    <div class="font-bold text-green-600 dark:text-green-500">User created successfully</div>
    <div>
      But You Account is not yet acticted to make changes to Translations. Also you been assigned
      any language to work on. Please contact the Admin to activate your account and assign you a
      language to work on.
    </div>
    <button
      class="variant-outline-primary btn"
      on:click={() => {
        if (on_verify) on_verify();
      }}>Continue</button
    >
  </div>
{:else}
  <form on:submit|preventDefault={create_new_user} class="mt-2 space-y-2.5 text-base">
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
      disabled={creating_new_user_status}
    >
      <Icon src={LuUserPlus} class="text-2xl" />
      <span>Signup</span>
    </button>
  </form>
{/if}
