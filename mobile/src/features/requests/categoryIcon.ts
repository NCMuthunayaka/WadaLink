import type { IconName } from '@/components/ui/Icon';

// Category names come from the database, so pick the icon by keyword.
const RULES: Array<[RegExp, IconName]> = [
  [/electric/i, 'bolt'],
  [/plumb/i, 'plumbing'],
  [/hvac|\bac\b|a\/c|cool|heat/i, 'ac-unit'],
  [/appliance/i, 'local-laundry-service'],
  [/\bit\b|smart|network/i, 'laptop-mac'],
  [/auto|vehicle|\bcar\b/i, 'directions-car'],
  [/clean/i, 'cleaning-services'],
  [/other/i, 'more-horiz'],
];

export function categoryIcon(name: string): IconName {
  return RULES.find(([pattern]) => pattern.test(name))?.[1] ?? 'build';
}