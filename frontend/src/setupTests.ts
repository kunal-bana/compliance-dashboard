import "@testing-library/jest-dom";

import fetch, { Headers, Request, Response } from "cross-fetch";
import { TextEncoder, TextDecoder } from "node:util";

Object.assign(global, {
  fetch,
  Headers,
  Request,
  Response,
  TextEncoder,
  TextDecoder,
});

const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (
        args[0].includes("linearGradient") ||
        args[0].includes("defs") ||
        args[0].includes("stop") ||
        args[0].includes("AG Grid") ||
        args[0].includes("fetch is not available") ||
        args[0].includes("unrecognized in this browser")
      )
    ) {
      return;
    }
    originalError(...args);
  };
});