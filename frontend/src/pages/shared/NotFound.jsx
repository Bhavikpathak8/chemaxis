import { Link } from 'react-router-dom';
import { Empty } from '../../ui/bits.jsx';

export function NotFound({ standalone }) {
  const body = (
    <Empty title="That page doesn't exist" hint="The link may be old, or the page may have moved."
      action={<Link to="/" className="btn btn-primary">Go to your workspace</Link>} />
  );
  return standalone ? <div className="grid min-h-screen place-items-center">{body}</div> : body;
}
