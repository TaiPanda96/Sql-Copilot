/**
 * Creates a ReadableStream from file content.
 */
export function createReadableStream(data: any): ReadableStream {
  const jsonString = JSON.stringify(data);

  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const view = encoder.encode(jsonString);
      controller.enqueue(view);
      controller.close();
    },
  });
}
