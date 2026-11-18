import { createPortal } from 'react-dom';

// Renders overlays straight into <body> so animated parents can't clip/offset them.
export default function Portal({ children }) {
  return createPortal(children, document.body);
}
