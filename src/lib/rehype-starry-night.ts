import type { Grammar } from "@wooorm/starry-night";
import type { ElementContent, Root } from "hast";

interface Options {
	grammars?: Array<Grammar> | null | undefined;
}

import { common, createStarryNight } from "@wooorm/starry-night";
import dockerfile from "@wooorm/starry-night/source.dockerfile";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

export default function rehypeStarryNight(options?: Options | null): (tree: Root) => Promise<void> {
	const settings = options || {};
	const grammars = settings.grammars || [...common, dockerfile];
	const starryNightPromise = createStarryNight(grammars);
	const prefix = "language-";

	return async function (tree: Root): Promise<void> {
		const starryNight = await starryNightPromise;

		visit(tree, "element", function (node, index, parent) {
			if (!parent || index === undefined || node.tagName !== "pre") {
				return;
			}

			const head = node.children[0];

			if (!head || head.type !== "element" || head.tagName !== "code") {
				return;
			}

			const classes = head.properties.className;

			if (!Array.isArray(classes)) return;

			const language = classes.find(function (d) {
				return typeof d === "string" && d.startsWith(prefix);
			});

			if (typeof language !== "string") return;

			const scope = starryNight.flagToScope(language.slice(prefix.length));

			// Maybe warn?
			if (!scope) return;

			const fragment = starryNight.highlight(toString(head), scope);
			const children = fragment.children as Array<ElementContent>;

			parent.children.splice(index, 1, {
				type: "element",
				tagName: "div",
				properties: {
					className: [
						"highlight",
						"highlight-" + scope.replace(/^source\./, "").replace(/\./g, "-")
					]
				},
				children: [{ type: "element", tagName: "pre", properties: {}, children }]
			});
		});
	};
}
