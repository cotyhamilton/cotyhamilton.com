<script lang="ts">
	import type { NavigationItem } from "../lib/types";
	import NavItem from "./nav-item.svelte";

	export let pages: NavigationItem[] = [];
</script>

<aside
	class="md-border-r-0 min-h-[100%] w-full flex-shrink-0 border-t p-8 text-sm md:w-60 md:flex-grow-0 md:border-r md:border-t-0 md:p-3"
	aria-label="Sidebar"
>
	<ul>
		{#each pages as page}
			<NavItem data={page} />
		{/each}
	</ul>
</aside>
