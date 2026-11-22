import type { FC, ReactNode } from 'react';
import { comment, lines, prompt, terminal } from '@/components/shared/Terminal.css';

export type TerminalLine = { command: ReactNode } | { comment: string };

type Props = { lines: TerminalLine[]; promptSign?: string; label?: string };

export const Terminal: FC<Props> = ({ lines: content, promptSign = '$', label }) => (
  <div className={terminal} aria-label={label}>
    <pre className={lines}>
      {content.map((line, index) => (
        // eslint-disable-next-line react-x/no-array-index-key -- static lines that never reorder
        <div key={index}>
          {'command' in line ? (
            <>
              <span className={prompt}>{promptSign} </span>
              {line.command}
            </>
          ) : (
            <span className={comment}>{line.comment}</span>
          )}
        </div>
      ))}
    </pre>
  </div>
);
