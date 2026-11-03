import { Section } from "@/components/belong/Doc";

export default function Problem() {
  return (
    <Section id="problem" n={1} title="The problem">
      <p className="bl-lede">
        Your attorneys say the product is fast but still makes mistakes. It mischaracterizes documents,
        and it gets trace-of-funds analysis wrong.
      </p>
      <p>
        A business visa takes 20 to 30 attorney hours, most of it assembly. Capital traced to its source
        is, in Belong’s words, “the most common reason a good file fails.” So this proposal starts with
        the money.
      </p>
    </Section>
  );
}
