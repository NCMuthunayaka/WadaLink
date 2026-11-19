/**
 * service_requests.title is required (max 200) but the design has no title field,
 * so build one from the category and the first sentence of the description.
 */
export function deriveTitle(categoryName: string, description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  const end = clean.search(/[.!?](\s|$)/);
  const sentence = end === -1 ? clean : clean.slice(0, end);
  const short = sentence.length > 60 ? `${sentence.slice(0, 57).trimEnd()}…` : sentence;
  return `${categoryName}: ${short}`.slice(0, 200);
}