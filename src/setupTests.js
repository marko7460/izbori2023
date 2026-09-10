import "@testing-library/jest-dom";
import "jest-canvas-mock";

class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ target }], this);
  }

  unobserve() {}

  disconnect() {}
}

if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = ResizeObserverMock;
}

if (typeof window.URL.createObjectURL === "undefined") {
  window.URL.createObjectURL = jest.fn(() => "blob:mock");
}

if (typeof window.URL.revokeObjectURL === "undefined") {
  window.URL.revokeObjectURL = jest.fn();
}
