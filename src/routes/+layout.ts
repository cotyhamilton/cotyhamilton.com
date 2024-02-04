import type { NavigationItem, Settings } from "../lib/types";
import type { LayoutLoad } from "./$types";

const buildBreadCrumbs = (
	nav: NavigationItem[],
	slugs: string[]
): { icon: string; link: string }[] => {
	function find(
		nav: NavigationItem[],
		breadCrumb: string,
		parentLink = ""
	): { icon: string; link: string } | null {
		for (const item of nav) {
			const link = parentLink ? `${parentLink}/${item.link}` : item.link;
			if (item.link === breadCrumb) {
				return { icon: item.icon, link };
			} else if (item.sub) {
				const foundIcon = find(item.sub, breadCrumb, link);
				if (foundIcon) return foundIcon;
			}
		}
		return null;
	}

	const breadCrumbs = [];
	for (const slug of slugs) {
		const crumb = find(nav, slug);
		if (crumb) breadCrumbs.push(crumb);
	}
	return breadCrumbs;
};

export const load = (async ({ fetch, params }) => {
	const res = await fetch("https://raw.githubusercontent.com/cotyhamilton/blog/main/settings.json");
	const data = (await res.json()) as Settings;
	const breadCrumbs = buildBreadCrumbs(data.navigation, params.slug?.split("/") ?? []);
	return {
		...data,
		breadCrumbs
	};
}) satisfies LayoutLoad;
