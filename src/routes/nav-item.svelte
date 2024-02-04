<script lang="ts">
	import type { NavigationItem } from "../lib/types";

	export let data: NavigationItem;
	export let parent = "";
</script>

<li class="list-none py-1">
	<a href={`/${parent ? parent + "/" : ""}${data.link}`}>{data.icon} {data.link}</a>
	{#if data.sub?.length}
		<ul class="pl-4">
			{#each data.sub as page}
				<svelte:self data={page} parent={parent ? parent + "/" + data.link : data.link} />
			{/each}
		</ul>
	{/if}
</li>
