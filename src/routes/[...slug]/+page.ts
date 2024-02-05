import handleMatter from "$lib/rehype-matter";
import rehypeStarryNight from "$lib/rehype-starry-night.js";
import { error } from "@sveltejs/kit";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { PageLoad } from "./$types";

export const ssr = false;

export const load = (async ({ fetch, params }) => {
	const url = params.slug
		? `https://raw.githubusercontent.com/cotyhamilton/blog/main/${params.slug}/README.md`
		: "https://raw.githubusercontent.com/cotyhamilton/blog/main/README.md";

	const res = await fetch(url);

	if (!res.ok) {
		if (res.status === 404) {
			error(res.status, "not found");
		} else {
			error(500, "internal error");
		}
	}

	const data = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeFormat)
		.use(rehypeStarryNight)
		.use(rehypeStringify)
		.use(remarkFrontmatter, ["yaml"])
		.use(handleMatter)
		.process(await res.text());

	return {
		text: data.value,
		matter: data.data.matter as { [key: string]: string }
	};
}) satisfies PageLoad;
