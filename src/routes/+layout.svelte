<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource/roboto/latin.css';
	import '../app.pcss';
</script>

<ModeWatcher />
<div class="contaiiner mx-auto mb-1 max-w-screen-lg">
	<slot />
</div>
