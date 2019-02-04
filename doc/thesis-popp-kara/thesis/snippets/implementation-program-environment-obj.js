let code = `
  truck.goIfGreen = function() {
    if (truck.lightIsGreen()) {
      truck.goForward();
    }
  }
`;
let f = new Function('truck', code);
f({
  goForward: () => world.command(Command.goForward),
  ...
  
  lightIsGreen: () => world.sensor(Sensor.lightIsGreen),
  ...
});
