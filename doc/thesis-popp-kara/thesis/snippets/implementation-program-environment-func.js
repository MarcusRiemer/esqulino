let code = `
  functions.goIfGreen = function() {
    if (sensor(Sensor.lightIsGreen)) {
      command(Command.goForward);
    }
  }
  functions.goIfGreen();
`;
let f = new Function('functions', 'sensor', 'Sensor', 'command', 'Command', code);
f({}, (s) => world.sensor(s), Sensor, (c) => world.command(c), Command);
