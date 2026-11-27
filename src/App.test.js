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
  expect(screen.getByText(/27\. децембра 2026/i)).toBeInTheDocument();
  expect(screen.getByText(/5\. децембар 2026/i)).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /провера бирачког списка/i })
  ).toHaveAttribute("href", "https://upit.birackispisak.gov.rs/");
  expect(screen.getByTestId("save-pdf")).toBeInTheDocument();
  expect(screen.getByTestId("official-document")).toBeInTheDocument();
  expect(screen.queryByLabelText(/место рођења/i)).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText(/адреса боравка у иностранству/i)
  ).not.toBeInTheDocument();
  expect(
    screen.getByLabelText(/5\. град, држава – где желим да гласам/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/својеручни потпис/i)).toBeInTheDocument();
});

test("only accepts 13 JMBG digits", () => {
  render(<App />);

  const jmbg = screen.getByLabelText(/јединствени матични број грађана/i);
  fireEvent.change(jmbg, { target: { value: "12ab345678901234567" } });
  expect(jmbg).toHaveValue("1234567890123");
});

test("field 5 accepts multiline voting location and mirrors it in the preview", () => {
  render(<App />);

  const locationField = screen.getByLabelText(
    /5\. град, држава – где желим да гласам/i
  );
  expect(locationField.tagName).toBe("TEXTAREA");

  const multiLineValue =
    "Делта, Британска Колумбија, Канада,\nили најближе место граду Ванкуверу";
  fireEvent.change(locationField, { target: { value: multiLineValue } });

  expect(locationField).toHaveValue(multiLineValue);
  expect(screen.getByTestId("official-vote-city-country")).toHaveTextContent(
    "Делта, Британска Колумбија, Канада, или најближе место граду Ванкуверу"
  );
});
