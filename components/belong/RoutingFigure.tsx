const INPUTS = [
  "Gate",
  "Document type",
  "Failed check",
  "Confidence",
  "Amount at issue",
  "Language",
  "Filing route",
  "Past correction rate",
];

const DESTINATIONS = [
  { name: "Frontier model", job: "Bad reads and unclear documents", guard: "Its answer must pass the arithmetic." },
  { name: "Domain model", job: "Recurring document families", guard: "Only where evals show it wins." },
  { name: "Client portal", job: "Missing or unclear evidence", guard: "Asks in the client’s language." },
  { name: "Attorney", job: "Reserved questions and legal meaning", guard: "Nothing closes without one." },
];

const PACKET = ["Page crop", "Extracted value", "Failed rule", "Citation", "Candidate answers", "One exact question"];

// Who looks next: hard rules, then a small scoring model, then the resolver.
export default function RoutingFigure() {
  return (
    <div className="bl-rfig bl-ui">
      <ol className="bl-rfig__steps">
        <li>
          <b>Hard rules</b>
          <span>A question reserved to the attorney goes straight to one. No model can override it.</span>
        </li>
        <li>
          <b>Decision model</b>
          <span>Scores everything else on eight inputs and picks the cheapest destination likely to close it.</span>
          <ul className="bl-rfig__inputs" aria-label="Router inputs">
            {INPUTS.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </li>
        <li>
          <b>Unsure</b>
          <span>If the router itself is unsure, the item goes to an attorney.</span>
        </li>
      </ol>
      <dl className="bl-dests">
        {DESTINATIONS.map((d) => (
          <div key={d.name}>
            <dt>{d.name}</dt>
            <dd>{d.job}</dd>
            <dd className="bl-dests__guard">{d.guard}</dd>
          </div>
        ))}
      </dl>
      <div className="bl-rfig__packet">
        <b>Every item arrives as a packet</b>
        <ul aria-label="Packet contents">
          {PACKET.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
