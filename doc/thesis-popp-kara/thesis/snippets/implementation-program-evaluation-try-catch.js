let code = `
  while() {
    truck.goForward();
  }
`;
try {
  let f = new Function(code);
} catch(error) {
  // SyntaxError: Unexpected token )
}
