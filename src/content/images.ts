/* Image registry. Cards and options carry a `visual` brief in flow.json; when
   an image has been produced for it, map the brief's key here. Anything not
   mapped renders as a placeholder that shows the brief, so the working group
   can see what is intended and nothing looks broken.

   Keys are the card or option id, so content edits do not orphan images. */
export const IMAGES: Record<string, string> = {
  // 'hello': '/art/hello.webp',
}
