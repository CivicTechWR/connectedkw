/**
 * Calculates the rank group for a single item based on its rank, the total number of items, and the desired number of groups.
 *
 * @param {number} rank - The rank of the item (e.g., from a 'combined_rank' property). This is expected to be a 1-based index (rank 1, 2, 3...).
 * @param {number} totalItems - The total number of items in the list (i.e., the length of the array).
 * @param {number} numGroups - The total number of groups to divide the items into (e.g., 3 for thirds, 5 for fifths).
 * @returns {number|null} The calculated rank group (a number, e.g., 1 for the top group), or null if the inputs are invalid.
 */
export default function getRankGroup(rank, totalItems, numGroups) {
  // --- Input Validation ---
  if (typeof rank !== 'number' || rank < 1) {
    console.error("Input 'rank' must be a number greater than or equal to 1.");
    return null;
  }
  if (typeof totalItems !== 'number' || totalItems <= 0) {
    console.error("Input 'totalItems' must be a positive number.");
    return null;
  }
  if (typeof numGroups !== 'number' || numGroups < 1) {
    console.error("Input 'numGroups' must be a number greater than or equal to 1.");
    return null;
  }

  // --- Group Size Calculation ---
  // Use Math.ceil to ensure that groups are sized correctly, even when the total
  // isn't perfectly divisible by the number of groups.
  const groupSize = Math.ceil(totalItems / numGroups);

  // --- Categorization Logic ---
  // Calculate which group the item's rank falls into.
  // Math.ceil ensures that ranks at a boundary (e.g., rank 9 for a group size of 9) fall into the correct group.
  const rankGroup = Math.ceil(rank / groupSize);

  return rankGroup;
}

