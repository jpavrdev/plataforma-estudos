// Turns a DOM selection into a portable quote for the notebook. KaTeX renders
// formulas as spans, so a raw selection.toString() linearizes them into token
// soup ("360 ∘ −100 ∘ ..."); each formula becomes its LaTeX source ($...$)
// instead, which reads back on the card and can even be re-rendered there.
export function selectionQuote(range: Range): string {
  const frag = range.cloneContents();
  // .katex is the root of both the hidden MathML and the visual spans; swap the
  // whole thing for the LaTeX carried by its annotation node.
  frag.querySelectorAll('.katex').forEach((katex) => {
    const tex = katex.querySelector('annotation')?.textContent;
    katex.replaceWith(document.createTextNode(tex ? `$${tex}$` : (katex.textContent ?? '')));
  });
  return (frag.textContent ?? '').replace(/\s+/g, ' ').trim();
}
