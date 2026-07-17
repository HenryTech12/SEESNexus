/**
 * Returns a Pollinations.ai URL that generates a relevant image from any text prompt
 */
export const getItemImage = (
  prompt: string,
  seed: string,
  width = 400,
  height = 300,
): string => {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
};
