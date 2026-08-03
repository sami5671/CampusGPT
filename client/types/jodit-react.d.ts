declare module 'jodit-react' {
  import React from 'react';
  
  export interface IJoditEditorProps {
    value?: string;
    config?: any;
    onBlur?: (newContent: string) => void;
    onChange?: (newContent: string) => void;
    className?: string;
    tabIndex?: number;
  }

  const JoditEditor: React.ComponentType<IJoditEditorProps>;
  export default JoditEditor;
}
