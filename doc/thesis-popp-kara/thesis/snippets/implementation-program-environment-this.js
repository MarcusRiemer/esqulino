let code = `
  this.goIfGreen = () => {
    if (this.lightIsGreen()) {
      this.goForward();
    }
  }
`;
let f = new Function(code);
f.call({
  goForward: () => world.command(Command.goForward),
  ...
  
  lightIsGreen: () => world.sensor(Sensor.lightIsGreen),
  ...
});
