import type React from "react";
import { useState } from "react";

interface RichTextRendererProps {
  text?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text }) => {
  if (!text) return null;
  const regex = /(\bhttps?:\/\/\S+|\*\*.*?\*\*|__.*?__|`.*?`|\|\|.*?\|\|)/g;
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/^https?:\/\//)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          return <em key={i}>{part.slice(2, -2)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-black/20 rounded px-1 font-mono text-[90%]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("||") && part.endsWith("||")) {
          return <SpoilerText key={i} text={part} />;
        }
        return part;
      })}
    </span>
  );
};

interface SpoilerTextProps {
  text: string;
}

const SpoilerText: React.FC<SpoilerTextProps> = ({ text }) => {
  const [revealed, setRevealed] = useState(false);
  const content = text.replace(/^\|\||\|\|$/g, "");
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      className={`cursor-pointer px-1 rounded transition-all duration-200 ${
        revealed ? "" : "bg-gray-400 text-transparent blur-[4px] select-none"
      }`}
    >
      {content}
    </span>
  );
};
