import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("react-signature-canvas", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(function SignatureCanvasMock(_props, ref) {
      React.useImperativeHandle(ref, () => ({
        clear: () => {},
        isEmpty: () => true,
        getCanvas: () => ({
          toDataURL: () => "",
        }),
      }));
      return React.createElement("div", { "data-testid": "signature-pad" });
    }),
  };
});

beforeEach(() => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    arrayBuffer: async () => new ArrayBuffer(8),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders the new abroad voting request and keeps data on-device", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: /захтев за гласање у иностранству/i })
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/име једног родитеља/i)).toBeInTheDocument();
  expect(
    screen.getByLabelText(/јединствени матични број грађана/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/подаци остају на вашем уређају/i)).toBeInTheDocument();
  expect(screen.getByTestId("save-pdf")).toBeInTheDocument();
  expect(screen.getByTestId("official-document")).toBeInTheDocument();
  expect(screen.queryByLabelText(/место рођења/i)).not.toBeInTheDocument();
});

test("only accepts 13 JMBG digits", () => {
  render(<App />);

  const jmbg = screen.getByLabelText(/јединствени матични број грађана/i);
  fireEvent.change(jmbg, { target: { value: "12ab345678901234567" } });
  expect(jmbg).toHaveValue("1234567890123");
});
