let code = `
  function goIfGreen() {
    if (lightIsGreen()) {
      goForward();
    }
  }
  goIfGreen();
`;
let f = new Function('goForward', ..., 'lightIsGreen', ..., code);
f(
  () => world.command(Command.goForward),
  ...
  () => world.sensor(Sensor.lightIsGreen),
  ...
);
