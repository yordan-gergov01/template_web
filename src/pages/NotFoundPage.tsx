import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        This page does not exist. <Link to="/">Go to the start page</Link>.
      </p>
    </>
  );
}
