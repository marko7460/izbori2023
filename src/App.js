import "./App.css";
import "./VoterRegistrationForm";
import VoterRegistrationForm from "./VoterRegistrationForm";
import VoterForm from "./VoterForm";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Times New Roman, serif",
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <VoterForm />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
