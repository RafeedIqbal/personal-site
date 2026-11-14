import { PUBLIC_SNAPSHOT } from "@/lib/publicus/seed";
import type { ProcurementRecord, Source } from "@/supabase/functions/_shared/domain";

// CanadaBuys keys are camelCase bilingual pairs (plus a bare "unspsc"). Lines such as "E-Mail:" inside a
// free-text description are not keys, so they stay with the description, which the panel never shows.
const FIELD = /^(unspsc|[a-z][A-Za-z]*(?:-[A-Za-z]+)+):\s?([\s\S]*)$/;
// Descriptions name contact people; notice URLs, attachments and commodity codes are long and add nothing here.
const OMITTED = /description|noticeURL|attachment|^unspsc/i;
const DEFAULT_ROW = "01";

function rawFields(text: string) {
  const fields: { key: string; value: string }[] = [];
  for (const line of text.replaceAll("\r", "").split("\n")) {
    const match = FIELD.exec(line);
    if (match) fields.push({ key: match[1], value: match[2] });
    else if (fields.length) fields[fields.length - 1].value += `\n${line}`;
  }
  return fields.filter((field) => !OMITTED.test(field.key));
}

function figure(value: number | null) {
  return value === null ? "n/a" : value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// An award whose total contract value is zero while its contract amount is not: the row disagrees with itself.
function contradicts(record: ProcurementRecord) {
  return record.kind === "award" && record.totalValue === 0 && (record.amount ?? 0) > 0;
}

function fileName(source?: Source) {
  return source?.url?.split("/").pop() ?? "CanadaBuys open data";
}

export default function RecordSheet() {
  // Awards first: their contract amounts and totals are where the rows disagree with themselves.
  const ordered = [...PUBLIC_SNAPSHOT.records.filter((record) => record.kind === "award"), ...PUBLIC_SNAPSHOT.records.filter((record) => record.kind !== "award")];
  const rows = ordered.map((record, index) => ({
    record,
    n: String(index + 1).padStart(2, "0"),
    source: PUBLIC_SNAPSHOT.sources.find((source) => source.id === record.sourceId),
  }));
  const captured = new Date(PUBLIC_SNAPSHOT.capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" });

  return (
    <figure className="pu-records pu-container" id="records" aria-labelledby="records-caption">
      <div className="pu-table">
        <table role="table" aria-labelledby="records-caption">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col" className="pu-col-n">#</th>
              <th role="columnheader" scope="col">Title</th>
              <th role="columnheader" scope="col">Buyer</th>
              <th role="columnheader" scope="col">Region</th>
              <th role="columnheader" scope="col">Notice</th>
              <th role="columnheader" scope="col">Published</th>
              <th role="columnheader" scope="col" className="pu-num">Contract amount</th>
              <th role="columnheader" scope="col" className="pu-num">Total contract value</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map(({ record, n }) => {
              const flagged = contradicts(record);
              return (
                <tr role="row" key={record.id} data-row={n}>
                  <td role="cell" className="pu-col-n">{n}</td>
                  <td role="cell" className="pu-col-title"><a href={`#cb-${n}`}>{record.title}</a></td>
                  <td role="cell" data-label="Buyer">{record.buyer}</td>
                  <td role="cell" data-label="Region" className={record.region === "Not stated" ? "pu-missing" : undefined}>{record.region.replaceAll("\n", " ")}</td>
                  <td role="cell" data-label="Notice">{record.kind === "award" ? "Award" : "Tender"}</td>
                  <td role="cell" data-label="Published" className="pu-date">{record.publishedAt || "n/a"}</td>
                  <td role="cell" data-label="Contract amount" className="pu-num">{flagged ? <mark>{figure(record.amount)}</mark> : figure(record.amount)}</td>
                  <td role="cell" data-label="Total contract value" className={`pu-num${flagged ? " pu-loud" : ""}`}>{flagged ? <mark>{figure(record.totalValue)}</mark> : figure(record.totalValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pu-raw-list">
        {rows.map(({ record, n, source }) => (
          <section key={record.id} id={`cb-${n}`} className="pu-raw" data-default={n === DEFAULT_ROW || undefined} aria-label={`Raw CSV row for record ${n}`}>
            <header>
              <h3>Row {n}, as published</h3>
              <span>{fileName(source)}{source?.row ? `, CSV row ${source.row}` : ""}</span>
            </header>
            <dl>
              {source ? rawFields(source.text).map(({ key, value }) => {
                const loud = contradicts(record) && /^(contractAmount|totalContractValue)-/.test(key);
                return (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{loud ? <mark>{value}</mark> : value}</dd>
                  </div>
                );
              }) : null}
            </dl>
          </section>
        ))}
      </div>

      <figcaption id="records-caption">
        <p>Ten records from the CanadaBuys open-data files, captured {captured} and shown as published. Row 1, a Business Development Bank of Canada award, lists a contract amount of $1,073,002.14 and a total contract value of $0.00 in the same CSV row. Rows 2 to 4 do the same.</p>
        <p className="pu-hint">Select a title to read its raw row.</p>
        <p className="pu-licence">Contains information licensed under the Open Government Licence – Canada.</p>
      </figcaption>
    </figure>
  );
}
