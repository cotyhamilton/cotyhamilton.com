<script lang="ts">
	import { page } from "$app/stores";
</script>

<main class="container m-auto h-full max-w-[72ch]">
	<div>
		<h1 class="mb-6 text-6xl font-extrabold">{$page.status}</h1>
		<p>{$page.error?.message}</p>
	</div>
</main>
