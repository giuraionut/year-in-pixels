type CodeBlockComponentProps = {
  node: {
    attrs: {
      language?: string;
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
