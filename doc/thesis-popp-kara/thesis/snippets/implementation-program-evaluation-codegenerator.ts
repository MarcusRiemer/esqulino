{
  type: {
    languageName: "trucklino_program",
    typeName: "if"
  },
  converter: {
    init: function(node: Node, process: CodeGeneratorProcess<State>) {
      process.addConvertedFragment('if (', node);
      node.getChildrenInCategory('pred').forEach((c) => process.generateNode(c));
      process.addConvertedFragment(') {', node, OutputSeparator.NEW_LINE_AFTER);
      process.indent(() => {
        node.getChildrenInCategory('body').forEach((c) => process.generateNode(c));
      });
      if (node.getChildrenInCategory('else').length > 0) {
        process.addConvertedFragment('} else {', node, OutputSeparator.NEW_LINE_AFTER);
        process.indent(() => {
          node.getChildrenInCategory('else').forEach((c) => process.generateNode(c));
        });
      }
      process.addConvertedFragment('}', node, OutputSeparator.NEW_LINE_AFTER);
    }
  }
}
