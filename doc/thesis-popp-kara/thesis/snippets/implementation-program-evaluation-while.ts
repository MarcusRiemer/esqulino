{
  type: {
    languageName: "trucklino_program",
    typeName: "loopWhile"
  },
  converter: {
    init: function(node: Node, process: CodeGeneratorProcess<State>) {
      process.addConvertedFragment('while (', node);
      node.getChildrenInCategory('pred').forEach((c) => process.generateNode(c));
      process.addConvertedFragment(') {', node, OutputSeparator.NEW_LINE_AFTER);
      process.indent(() => {
        process.addConvertedFragment('yield* truck.doNothing();', node, OutputSeparator.NEW_LINE_AFTER);
        node.getChildrenInCategory('body').forEach((c) => process.generateNode(c));
      });
      process.addConvertedFragment('}', node, OutputSeparator.NEW_LINE_AFTER);
    }
  }
}
