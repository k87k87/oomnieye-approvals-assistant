export interface TimeoutOptions {
  timeoutMs?: number;
  operationName?: string;
}

/**
 * Wraps an asynchronous operation with an 8-second AbortController timeout
 * and provides a non-500 graceful degradation fallback on timeout or failure.
 */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  fallback: (error: Error) => Promise<T> | T,
  options: TimeoutOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const operationName = options.operationName ?? "AI Operation";
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
    console.warn(
      `[Graceful Degradation] ${operationName} failed/timed out: "${error.message}". Executing fallback.`,
    );
    return await fallback(error);
  }
}
