import React, { useRef } from "react";

import { TextField, Box, Typography, Button, Link } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { MobileDatePicker } from "@mui/x-date-pickers";

export default function VoterForm() {
  const sigCanvasRef = useRef({});
  const [value, setValue] = React.useState(null);
  const robotoFontFamily = [
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(",");

  return (
    <Box m={1} width="210mm" height="297mm" fontFamily="Times New Roman, serif">
      <Typography
        variant="subtitle1"
        component="div"
        fontFamily="Times New Roman, serif"
      >
        У складу са чланом 16. став 1. Закона о Јединственом бирачком списку
        <br />
        („Службени гласник Републике Србије“ број 104/2009 и 99/2011) подносим:
        <br />
        <br />
      </Typography>
      <Typography
        variant="h6"
        component="div"
        fontFamily="Times New Roman, serif"
        ml={20}
      >
        З А Х Т Е В
        <br />
      </Typography>
      <Typography
        variant="h6"
        component="div"
        fontFamily="Times New Roman, serif"
        ml={5}
      >
        ЗА УПИС У БИРАЧКИ СПИСАК ПОДАТКА
        <br />
      </Typography>
      <Typography
        variant="h6"
        component="div"
        fontFamily="Times New Roman, serif"
        ml={4}
      >
        ДА ЋЕ БИРАЧ ГЛАСАТИ У ИНОСТРАНСТВУ
        <br />
        <br />
      </Typography>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          1. Име и презиме:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
            style={{ fontFamily: "Times New Roman, serif", fontSize: "1rem" }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          2. Место рођења:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          3. Јединствени матични број грађана:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          4. Адреса пребивалишта у Србији:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          5. Адреса боравка у иностранству:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignContent="center" mb={1}>
        <Typography
          variant="subtitle1"
          component="div"
          fontFamily="Times New Roman, serif"
          mr={1}
        >
          6. Град, држава – где желим да гласам <br /> у иностранству:
        </Typography>
        <Box flexGrow={1}>
          <TextField
            id="standard-basic"
            label=""
            variant="standard"
            fullWidth
          />
        </Box>
      </Box>
      <br />
      <Typography
        variant="subtitle1"
        component="div"
        fontFamily="Times New Roman, serif"
        //mb={2}
      >
        Уз захтев прилажем копију пасоша/личне карте Републике Србије.
      </Typography>
      <Box display="flex" flexDirection="column" mb={1}>
        <Box display="flex" flexDirection="row">
          <MobileDatePicker
            label=""
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            className="no-print"
            // mark this DatePicker with the class no-print
            sx={{
              "&& .MuiOutlinedInput-notchedOutline": {
                // Customize border
                borderColor: "black", // Color
                borderLeftColor: "white", // Specific side
                borderRightColor: "white", // Specific side
                borderTopColor: "white", // Specific side
              },
              "&& .MuiInputBase-input": {
                // Customize input
                padding: "0px", // Specific side
              },
            }}
          />
        </Box>
        <Typography ml={4}>(датум)</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mb={1}>
        <TextField id="standard-basic" label="" variant="standard" />
        <Typography ml={4}>(телефон)</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mb={1}>
        <TextField id="standard-basic" label="" variant="standard" />
        <Typography ml={4}>(и-мејл)</Typography>
      </Box>
      <Box mb={2}>
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="black"
          canvasProps={{
            width: 250,
            height: 100,
            className: "sigCanvas",
            style: { borderBottom: "1px solid #000000" },
          }}
        />
        <Typography ml={4}>Потпис бирача:</Typography>
      </Box>
      <Button
        onClick={() => sigCanvasRef.current.clear()}
        sx={{
          "@media print": { display: "none" },
          fontFamily: robotoFontFamily,
          mr: 1,
        }}
        variant="contained"
      >
        Очисти потпис
      </Button>
      <Button
        onClick={() => window.print()}
        sx={{
          "@media print": { display: "none" },
          fontFamily: robotoFontFamily,
        }}
        variant="contained"
      >
        Одштампај у PDF
      </Button>
      <Box
        sx={{
          "@media print": { display: "none" },
          fontFamily: robotoFontFamily,
        }}
        ml={1}
        mt={1}
        display="flex"
        flexDirection="row"
        alignContent={"center"}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            fontFamily: robotoFontFamily,
          }}
          mr={1}
        >
          Source Code:{" "}
        </Typography>
        <Box>
          <Link
            href="https://github.com/marko7460/izbori2023"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontFamily: robotoFontFamily,
            }}
          >
            https://github.com/marko7460/izbori2023
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
