export const createBundle = (filesystem) => {
	return {
		/**
		 * Initialize repository by creating necessary 
		 * directory structure.
		 */
		init: () => { },

		/**
		 * Display state of repository by comparing head commit
		 * with working directory.
		 */
		state: () => { },

		/**
		 * Checkout branch by name / create branch by name.
		 * New branch should point to head commit.
		 * Update head accordingly.
		 */
		checkout: (branchName) => {

		}
	}
}