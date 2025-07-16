
'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoExpandingTextarea = React.forwardRef<HTMLTextAreaElement, AutoExpandingTextareaProps>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = event.currentTarget;
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`;
      if (props.onInput) {
        props.onInput(event);
      }
    };
    
    // Adjust on initial load if there's a defaultValue
    React.useEffect(() => {
        if(internalRef.current) {
            handleInput({ currentTarget: internalRef.current } as React.FormEvent<HTMLTextAreaElement>);
        }
    }, []);

    return (
      <Textarea
        ref={combinedRef}
        onInput={handleInput}
        className={cn('resize-none overflow-hidden', className)}
        {...props}
      />
    );
  }
);
AutoExpandingTextarea.displayName = 'AutoExpandingTextarea';

export { AutoExpandingTextarea };
