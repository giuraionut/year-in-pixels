type CodeBlockComponentProps = {
    node: {
      attrs: {
        language?: string; // Make 'language' optional
      };
    };
    updateAttributes: (attributes: Record<string, unknown>) => void;
    extension: {
      options: {
        lowlight: {
          listLanguages: () => string[];
        };
      };
    };
  };
  