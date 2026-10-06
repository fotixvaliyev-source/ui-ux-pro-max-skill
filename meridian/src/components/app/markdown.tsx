import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Safe markdown: raw HTML is not rendered, and javascript: links are stripped by react-markdown. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
