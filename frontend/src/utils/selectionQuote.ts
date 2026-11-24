// Turns a DOM selection into a portable quote for the notebook. KaTeX renders
// formulas as spans, so a raw selection.toString() linearizes them into token
// soup ("360 ∘ −100 ∘ ..."); each formula becomes its LaTeX source ($...$)
// instead, which reads back on the card and can even be re-rendered there.
export function selectionQuote(range: Range): string {
  expandIntoWholeFormulas(range);
  const frag = range.cloneContents();
  // .katex is the root of both the hidden MathML and the visual spans; swap the
  // whole thing for the LaTeX carried by its annotation node.
  frag.querySelectorAll('.katex').forEach((katex) => {
    const tex = katex.querySelector('annotation')?.textContent;
    katex.replaceWith(document.createTextNode(tex ? `$${tex}$` : (katex.textContent ?? '')));
  });
  return (frag.textContent ?? '').replace(/\s+/g, ' ').trim();
}

// Formulas are atomic: a selection that starts or ends in the middle of one
// would clone only part of its spans (no LaTeX annotation there) and degrade
// into linearized text. Nudge the range to the formula boundaries, so the quote
// always carries the whole formula.
function expandIntoWholeFormulas(range: Range) {
  const startKatex = closestKatex(range.startContainer);
  if (startKatex && startKatex.parentElement) {
    range.setStart(startKatex.parentElement, indexOfNode(startKatex));
  }
  const endKatex = closestKatex(range.endContainer);
  if (endKatex && endKatex.parentElement) {
    range.setEnd(endKatex.parentElement, indexOfNode(endKatex) + 1);
  }
}

function closestKatex(node: Node | null): Element | null {
  return node instanceof Element ? node.closest('.katex') : node?.parentElement?.closest('.katex') ?? null;
}

function indexOfNode(el: Element): number {
  return el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
}
