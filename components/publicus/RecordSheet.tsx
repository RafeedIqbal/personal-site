"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_SNAPSHOT } from "@/lib/publicus/seed";
import { contradicts, figure, rawFields, recordRows } from "@/lib/publicus/records";

const rows = recordRows(PUBLIC_SNAPSHOT);

function fileName(url?: string) {
  return url?.split("/").pop() ?? "CanadaBuys open data";
}

// The ten CanadaBuys rows as published, shown inside the explorer's records dialog.
export default function RecordSheet({ initialRow = "01" }: { initialRow?: string }) {
  const [active, setActive] = useState(initialRow);
  const raw = useRef<HTMLElement>(null);
  const chosen = useRef(initialRow !== "01");
  // Show the chosen row's fields: on a phone they sit below all ten stacked records. The timeout lets the
  // dialog open first when a link chose the row.
  useEffect(() => {
    if (!chosen.current) return;
    const timer = setTimeout(() => raw.current?.scrollIntoView({ block: "start" }), 0);
    return () => clearTimeout(timer);
  }, [active]);
  const open = rows.find((row) => row.n === active) ?? rows[0];
  const captured = new Date(PUBLIC_SNAPSHOT.capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" });

  return (
    <figure className="pu-records" aria-labelledby="records-caption">
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
                <tr role="row" key={record.id} data-row={n} className={n === open.n ? "is-active" : undefined}>
                  <td role="cell" className="pu-col-n">{n}</td>
                  <td role="cell" className="pu-col-title"><button type="button" aria-pressed={n === open.n} aria-controls="pu-raw" onClick={() => { chosen.current = true; setActive(n); }}>{record.title}</button></td>
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

      <section ref={raw} key={open.n} id="pu-raw" className="pu-raw" aria-label={`Raw CSV row for record ${open.n}`}>
        <header>
          <h4>Row {open.n}, as published</h4>
          <span>{fileName(open.source?.url)}{open.source?.row ? `, CSV row ${open.source.row}` : ""}</span>
        </header>
        <dl>
          {open.source ? rawFields(open.source.text).map(({ key, value }) => {
            const loud = contradicts(open.record) && /^(contractAmount|totalContractValue)-/.test(key);
            return (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{loud ? <mark>{value}</mark> : value}</dd>
              </div>
            );
          }) : null}
        </dl>
      </section>

      <figcaption id="records-caption">
        <p>Ten records from the CanadaBuys open-data files, captured {captured} and shown as published. Row 1, a Business Development Bank of Canada award, lists a contract amount of $1,073,002.14 and a total contract value of $0.00 in the same CSV row. Rows 2 to 4 do the same.</p>
        <p className="pu-hint">Select a title to read its raw row.</p>
        <p className="pu-licence">Contains information licensed under the Open Government Licence – Canada.</p>
      </figcaption>
    </figure>
  );
}
