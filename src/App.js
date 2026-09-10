import "./App.css";
import VoterForm from "./VoterForm";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
    },
    palette: {
      primary: {
        main: "#0c4076",
      },
      secondary: {
        main: "#c6363c",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VoterForm />
    </ThemeProvider>
  );
}

export default App;
