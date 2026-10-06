import { useRouteError } from 'react-router';

/** Shown by the router when a page fails to render. */
export function RouteErrorPage() {
  const error = useRouteError();

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>The page could not be displayed. Reload the page to try again.</p>
      {import.meta.env.DEV && error instanceof Error && <pre>{error.message}</pre>}
    </main>
  );
}
