while (truck.lightIsRed()) {
  yield* truck.doNothing();
  yield* truck.wait();
}
