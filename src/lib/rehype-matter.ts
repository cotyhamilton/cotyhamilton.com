import type { Node } from "unist";
import type { VFile } from "vfile";
import { matter } from "vfile-matter";

/**
 * Parse YAML frontmatter and expose it at `file.data.matter`.
 *
 * @returns
 *   Transform.
 */
export default function handleMatter() {
	/**
	 * Transform.
	 *
	 * @param {Node} _tree
	 *   Tree.
	 * @param {VFile} file
	 *   File.
	 * @returns {undefined}
	 *   Nothing.
	 */
	return function (_tree: Node, file: VFile): void {
		matter(file);
	};
}
