export interface TimeoutOptions {
  timeoutMs?: number;
  operationName?: string;
}

// Runs an async task with an AbortSignal timeout and falls back to a default value if it fails or times out
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  fallback: (error: Error) => Promise<T> | T,
  options: TimeoutOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const operationName = options.operationName ?? "Operation";
  const controller = new AbortController();

  let timer: NodeJS.Timeout | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        const err = new Error(`${operationName} timed out after ${timeoutMs}ms`);
        err.name = "TimeoutError";
        reject(err);
      }, timeoutMs);
    });

    const result = await Promise.race([operation(controller.signal), timeoutPromise]);

    if (timer) clearTimeout(timer);
    return result;
  } catch (err) {
    if (timer) clearTimeout(timer);
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn(`[withTimeout] ${operationName} failed or timed out (${error.message}). Using fallback.`);
    return await fallback(error);
  }
}
