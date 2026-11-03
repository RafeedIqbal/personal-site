import { Module } from "@/components/belong/Doc";

export default function Problem() {
  return (
    <Module
      id="problem"
      numeral="I"
      title="The problem"
      lede="Your attorneys say the product is fast but still makes mistakes. It mischaracterizes documents, and it gets trace-of-funds analysis wrong."
    >
      <p className="bl-text">
        A business visa takes 20 to 30 attorney hours, most of it assembly. Capital traced to its source
        is, in Belong’s words, “the most common reason a good file fails.” So the architecture starts with
        the money, and proves every label before anyone relies on it.
      </p>
    </Module>
  );
}
