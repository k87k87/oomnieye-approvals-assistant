import "@testing-library/jest-dom";

// Polyfill window.HTMLElement.prototype.scrollIntoView if not defined in jsdom
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
