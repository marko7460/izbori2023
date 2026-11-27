import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import dayjs from "dayjs";
import OfficialDocument from "./OfficialDocument";
import {
  DEADLINE,
  ELECTION_SUMMARY,
  EMPTY_FORM_VALUES,
  FIELDS,
  FORM_TITLE,
  NOTE_LINES,
} from "./lib/formCopy";
import { buildPdfFilename, generateVoterPdf } from "./lib/generatePdf";
import { digitsOnly } from "./lib/jmbg";
import { PAGE_WIDTH_PX } from "./lib/pageSize";
import { savePdfOnDevice } from "./lib/savePdf";
import "./VoterForm.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function usePreviewScale(containerRef) {
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const update = () => {
      const width = node.clientWidth || 320;
      setScale(Math.min(width / PAGE_WIDTH_PX, 1));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef]);

  return scale;
}

function SignatureField({ signatureRef, onStroke }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(320);
  const widthRef = useRef(320);
  const pendingRestoreRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const update = () => {
      const nextWidth = Math.max(Math.round(node.clientWidth), 200);
      if (nextWidth === widthRef.current) {
        return;
      }

      const pad = signatureRef.current;
      if (pad && !pad.isEmpty() && typeof pad.toData === "function") {
        pendingRestoreRef.current = {
          data: pad.toData(),
          fromWidth: widthRef.current,
        };
      }

      widthRef.current = nextWidth;
      setWidth(nextWidth);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [signatureRef]);

  useEffect(() => {
    const pending = pendingRestoreRef.current;
    const pad = signatureRef.current;
    if (!pending || !pad || typeof pad.fromData !== "function") {
      return;
    }

    pendingRestoreRef.current = null;
    const scaleX = pending.fromWidth > width ? width / pending.fromWidth : 1;
    const restored =
      scaleX === 1
        ? pending.data
        : pending.data.map((stroke) =>
            stroke.map((point) => ({ ...point, x: point.x * scaleX }))
          );
    pad.fromData(restored);
    onStroke();
  }, [width, signatureRef, onStroke]);

  return (
    <div className="signature-box" ref={containerRef}>
      <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        clearOnResize={false}
        onEnd={onStroke}
        canvasProps={{
          width,
          height: 140,
          className: "sigCanvas",
          "aria-label": "Поље за потпис",
        }}
      />
    </div>
  );
}

export default function VoterForm() {
  const signatureRef = useRef(null);
  const previewRef = useRef(null);
  const fontsRef = useRef(null);
  const previewScale = usePreviewScale(previewRef);

  const [values, setValues] = useState({
    ...EMPTY_FORM_VALUES,
    date: dayjs().format("YYYY-MM-DD"),
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const controller = new AbortController();

    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/fonts/LiberationSerif-Regular.ttf`, {
        signal: controller.signal,
      }).then((response) => response.arrayBuffer()),
      fetch(`${process.env.PUBLIC_URL}/fonts/LiberationSerif-Bold.ttf`, {
        signal: controller.signal,
      }).then((response) => response.arrayBuffer()),
    ])
      .then(([regular, bold]) => {
        if (!cancelled) {
          fontsRef.current = { regular, bold };
        }
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") {
          return;
        }
        setStatus({
          type: "error",
          message: "Није успело учитавање фонтова за PDF. Освежите страницу.",
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const formattedDate = useMemo(() => {
    if (!values.date) {
      return "";
    }
    const parsed = dayjs(values.date);
    return parsed.isValid() ? parsed.format("DD.MM.YYYY.") : values.date;
  }, [values.date]);

  const previewValues = useMemo(
    () => ({
      ...values,
      date: formattedDate,
    }),
    [formattedDate, values]
  );

  const emailWarning = useMemo(() => {
    if (!values.email) {
      return "";
    }
    return EMAIL_PATTERN.test(values.email)
      ? ""
      : "Проверите формат и-мејл адресе.";
  }, [values.email]);

  const handleChange = (field) => (event) => {
    const nextValue =
      field === "jmbg" ? digitsOnly(event.target.value) : event.target.value;
    setValues((current) => ({ ...current, [field]: nextValue }));
  };

  const captureSignature = useCallback(() => {
    const canvas = signatureRef.current;
    if (!canvas || canvas.isEmpty()) {
      setSignatureDataUrl("");
      return;
    }
    setSignatureDataUrl(canvas.getCanvas().toDataURL("image/png"));
  }, []);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureDataUrl("");
  };

  const missingFields = () => {
    const missing = [];
    if (!values.fullName.trim()) missing.push("име и презиме");
    if (!values.parentName.trim()) missing.push("име родитеља");
    if (!values.jmbg.trim()) missing.push("ЈМБГ");
    if (!values.serbiaAddress.trim()) missing.push("адресу у Србији");
    if (!values.voteCityCountry.trim()) missing.push("град и државу гласања");
    if (!values.date) missing.push("датум");
    if (!values.phone.trim()) missing.push("телефон");
    if (!values.email.trim()) missing.push("и-мејл");
    if (!signatureDataUrl) missing.push("потпис");
    return missing;
  };

  const savePdf = async () => {
    if (emailWarning) {
      setStatus({
        type: "error",
        message: emailWarning,
      });
      return;
    }

    const missing = missingFields();
    if (missing.length > 0) {
      const proceed = window.confirm(
        `Нисте попунили: ${missing.join(", ")}. Ипак сачувати PDF?`
      );
      if (!proceed) {
        return;
      }
    }

    if (!fontsRef.current) {
      setStatus({
        type: "error",
        message: "Фонтови за PDF још нису спремни. Сачекајте секунду и покушајте поново.",
      });
      return;
    }

    setBusy(true);
    setStatus(null);

    try {
      captureSignature();
      const signature =
        signatureDataUrl ||
        (signatureRef.current && !signatureRef.current.isEmpty()
          ? signatureRef.current.getCanvas().toDataURL("image/png")
          : "");

      const pdfBytes = await generateVoterPdf(
        {
          ...previewValues,
          signatureDataUrl: signature,
        },
        fontsRef.current
      );
      const filename = buildPdfFilename(values.fullName);
      const result = await savePdfOnDevice(pdfBytes, filename);

      if (result === "cancelled") {
        setStatus({ type: "ok", message: "Чување је отказано." });
      } else if (result === "shared") {
        setStatus({
          type: "ok",
          message: "PDF је спреман за чување или слање са вашег уређаја.",
        });
      } else {
        setStatus({
          type: "ok",
          message: "PDF је сачуван на ваш уређај. Ништа није послато на сервер.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "PDF није могао да се направи. Покушајте поново или користите штампање.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box className="form-shell">
      <div className="form-flag no-print" aria-hidden="true">
        <span className="red" />
        <span className="blue" />
        <span className="white" />
      </div>

      <div className="form-wrap">
        <header className="form-hero no-print">
          <Typography variant="h1">{FORM_TITLE}</Typography>
          <Typography>
            {ELECTION_SUMMARY} Попуните га, потпишите и сачувајте PDF на телефон или
            рачунар.
          </Typography>
        </header>

        <Alert className="deadline-banner no-print" severity="warning">
          <strong>{DEADLINE.title}</strong>
          {DEADLINE.body}{" "}
          <Link href={DEADLINE.registerUrl} target="_blank" rel="noopener noreferrer">
            {DEADLINE.registerLabel}
          </Link>
        </Alert>

        <Alert className="privacy-banner no-print" severity="success" icon={false}>
          <strong>Подаци остају на вашем уређају.</strong>
          Ништа се не шаље и не чува на серверу. Када сачувате PDF, фајл остаје
          само код вас. This form never uploads your information.
        </Alert>

        <div className="layout">
          <section className="panel no-print">
            <Typography variant="h2" component="h2">
              Подаци са обрасца
            </Typography>

            {FIELDS.map((field) => (
              <div className="field" key={field.id}>
                <label className="field-label" htmlFor={field.id}>
                  {field.number}. {field.label}
                </label>
                <TextField
                  id={field.id}
                  helperText={field.helper}
                  value={values[field.id]}
                  onChange={handleChange(field.id)}
                  fullWidth
                  multiline={Boolean(field.multiline)}
                  minRows={field.minRows}
                  maxRows={field.maxRows}
                  autoComplete={field.autoComplete}
                  inputProps={{
                    inputMode: field.inputMode,
                    pattern: field.id === "jmbg" ? "[0-9]*" : undefined,
                    maxLength: field.id === "jmbg" ? 13 : undefined,
                    "aria-describedby":
                      field.id === "jmbg" ? "jmbg-help" : undefined,
                  }}
                />
                {field.id === "jmbg" ? (
                  <div className="jmbg-meter" id="jmbg-help" aria-hidden="true">
                    {Array.from({ length: 13 }, (_, index) => (
                      <span
                        key={index}
                        className={values.jmbg[index] ? "filled" : ""}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <div className="field">
              <label className="field-label" htmlFor="date">
                Датум
              </label>
              <TextField
                id="date"
                type="date"
                value={values.date}
                onChange={handleChange("date")}
                fullWidth
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="phone">
                Контакт телефон
              </label>
              <TextField
                id="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange("phone")}
                fullWidth
                inputProps={{ inputMode: "tel" }}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="email">
                И-мејл
              </label>
              <TextField
                id="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange("email")}
                error={Boolean(emailWarning)}
                helperText={emailWarning || "За пријем решења"}
                fullWidth
                inputProps={{ inputMode: "email" }}
              />
            </div>

            <div className="signature-header">
              <p className="field-label">Потпис</p>
              <p className="signature-hint">
                Потпишите се прстом (на телефону) или мишем (на рачунару).
              </p>
            </div>
            <SignatureField
              signatureRef={signatureRef}
              onStroke={captureSignature}
            />
            <div className="actions">
              <Button variant="outlined" onClick={clearSignature}>
                Очисти потпис
              </Button>
              <Button
                variant="contained"
                onClick={savePdf}
                disabled={busy}
                data-testid="save-pdf"
              >
                {busy ? "Правим PDF…" : "Сачувај PDF на уређај"}
              </Button>
              <Button variant="outlined" onClick={() => window.print()}>
                Одштампај
              </Button>
            </div>
            {status ? (
              <p
                className={status.type === "error" ? "status-error" : "status-ok"}
                role="status"
              >
                {status.message}
              </p>
            ) : null}
          </section>

          <section className="preview-column panel">
            <Typography variant="h2" component="h2" className="no-print">
              Преглед службеног обрасца
            </Typography>
            <div className="preview-frame" ref={previewRef}>
              <OfficialDocument
                values={previewValues}
                signatureDataUrl={signatureDataUrl}
                scale={previewScale}
              />
            </div>

            <div className="actions no-print">
              <Button variant="contained" onClick={savePdf} disabled={busy}>
                {busy ? "Правим PDF…" : "Сачувај PDF на уређај"}
              </Button>
              <Button variant="outlined" onClick={() => window.print()}>
                Одштампај
              </Button>
            </div>

            <div className="fine-print no-print">
              {NOTE_LINES.join(" ")}
            </div>
            <div className="source-link no-print">
              Изворни код:{" "}
              <Link
                href="https://github.com/marko7460/izbori2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/marko7460/izbori2023
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Box>
  );
}
