<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.matter.title || data.title}</title>
</svelte:head>

<main class="markdown-body m-auto max-w-[72ch]">
	<p class="!mb-6 text-8xl">{data.matter.icon}</p>
	{@html data.text}
</main>
