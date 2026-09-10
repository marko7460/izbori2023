import "./OfficialDocument.css";
import { HEADER_LINES, NOTE_LINES, PASSPORT_NOTE, TITLE_LINES } from "./lib/formCopy";

export default function OfficialDocument({ values, signatureDataUrl, scale = 1 }) {
  const jmbgDigits = String(values.jmbg || "").padEnd(13, " ").slice(0, 13).split("");

  return (
    <div className="official-scale" style={{ height: `${842 * scale}pt` }}>
      <div
        className="official-page"
        style={{ transform: `scale(${scale})` }}
        data-testid="official-document"
      >
        <div className="official-abs official-header">
          {HEADER_LINES[0]}
          <br />
          {HEADER_LINES[1]}
        </div>
        <div className="official-abs official-title official-title-1">{TITLE_LINES[0]}</div>
        <div className="official-abs official-title official-title-2">{TITLE_LINES[1]}</div>
        <div className="official-abs official-title official-title-3">{TITLE_LINES[2]}</div>

        <div className="official-abs official-label-1">1. Име и презиме</div>
        <div className="official-abs official-label-2">2. Име једног родитеља</div>
        <div className="official-abs official-label-3">3. Јединствени матични број грађана</div>
        <div className="official-abs official-label-4">4. Адреса пребивалишта у Р. Србији</div>
        <div className="official-abs official-label-5">5. Адреса боравка у иностранству</div>
        <div className="official-abs official-label-6">
          6. Град, држава – где желим да гласам
          <br />у иностранству
        </div>

        <div className="official-line official-line-1" />
        <div className="official-line official-line-2" />
        <div className="official-line official-line-4" />
        <div className="official-line official-line-5" />
        <div className="official-line official-line-6" />

        <div className="official-abs official-value official-value-1">{values.fullName}</div>
        <div className="official-abs official-value official-value-2">{values.parentName}</div>
        <div className="official-jmbg" aria-hidden="true">
          {jmbgDigits.map((digit, index) => (
            <div className="official-jmbg-cell" key={`jmbg-${index}`}>
              {digit.trim()}
            </div>
          ))}
        </div>
        <div className="official-abs official-value official-value-4">{values.serbiaAddress}</div>
        <div className="official-abs official-value official-value-5">{values.abroadAddress}</div>
        <div className="official-abs official-value official-value-6">{values.voteCityCountry}</div>

        <div className="official-abs official-passport">{PASSPORT_NOTE}</div>

        <div className="official-line official-line-date" />
        <div className="official-line official-line-sign" />
        <div className="official-line official-line-phone" />
        <div className="official-line official-line-email" />
        <div className="official-line official-line-note" />

        <div className="official-abs official-date-value">{values.date}</div>
        {signatureDataUrl ? (
          <img
            className="official-signature"
            src={signatureDataUrl}
            alt=""
          />
        ) : null}
        <div className="official-abs official-phone-value">{values.phone}</div>
        <div className="official-abs official-email-value">{values.email}</div>

        <div className="official-abs official-caption-date">(датум)</div>
        <div className="official-abs official-caption-sign">(потпис)</div>
        <div className="official-abs official-caption-phone">(контакт телефон)</div>
        <div className="official-abs official-caption-email">(и-мејл)</div>

        <div className="official-abs official-note">
          {NOTE_LINES[0]}
          <br />
          {NOTE_LINES[1]}
          <br />
          {NOTE_LINES[2]}
        </div>
      </div>
    </div>
  );
}
