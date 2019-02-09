if (truck.lightIsGreen()) {
  yield* truck.goForward();
} else {
  yield* truck.wait();
}
