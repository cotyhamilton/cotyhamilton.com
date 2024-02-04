<script lang="ts">
	import "../app.pcss";
	import type { LayoutData } from "./$types";
	import Sidebar from "./sidebar.svelte";

	export let data: LayoutData;
</script>

<div class="flex min-h-[100%] flex-col md:flex-row-reverse">
	<div class="flex-1 overflow-x-scroll md:border-l-0">
		<header class="p-3 text-sm">
			<img class="inline" src="/icon.png" alt="logo" width="20px" /><a href="/" class="mx-1"
				>{data.title}</a
			>
			{#each data.breadCrumbs as breadCrumb}
				<span class="mx-1 text-muted">/</span><a href={"/" + breadCrumb.link} class="mx-1"
					>{breadCrumb.icon} {breadCrumb.link.split("/").slice(-1)[0]}</a
				>
			{/each}
		</header>
		<main class="mt-12 p-8">
			<slot />
		</main>
	</div>
	<Sidebar pages={data.navigation} />
</div>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		height: 100%;
	}
</style>
