import { Fragment } from "react";

/**
 * Tiny inline markup for content strings: **phrase** becomes a yellow highlighter mark.
 * Keeps copy in site.ts as plain strings while letting key names stand out.
 */
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <mark key={i} className="hl">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
