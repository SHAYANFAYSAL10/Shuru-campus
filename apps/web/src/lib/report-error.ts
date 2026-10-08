/** An error as an error boundary receives it. `digest` matches the server log for server errors. */
export type BoundaryError = Error & { digest?: string };

type Log = (...data: unknown[]) => void;

function consoleError(...data: unknown[]) {
  // The one sanctioned console call in the web app: error boundaries report through here.
  // eslint-disable-next-line no-console -- see above
  console.error(...data);
}

/**
 * The one place rendering errors caught by an error boundary are reported. Phase 1 logs them to
 * the browser console, tagged with the digest; a monitoring service plugs in here later.
 */
export function reportError(error: BoundaryError, log: Log = consoleError) {
  log(error.digest ? `Render error (digest ${error.digest})` : 'Render error', error);
}
