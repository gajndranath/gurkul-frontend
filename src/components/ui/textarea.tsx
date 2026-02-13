import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = (props) => (
  <textarea
    className="px-2 py-1 border rounded focus:outline-none focus:ring resize-none"
    {...props}
  />
);
