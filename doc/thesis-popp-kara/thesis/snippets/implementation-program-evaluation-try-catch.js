let code = `
  while() {
    this.goForward();
  }
`;
try {
  let f = new Function(code);
} catch(error) {
  // SyntaxError: Unexpected token )
}
