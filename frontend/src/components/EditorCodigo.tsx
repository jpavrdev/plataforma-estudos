import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Linguagem } from '../services/desafios';

const EXTENSOES: Record<Linguagem, ReturnType<typeof javascript>> = {
  javascript: javascript(),
  python: python(),
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: Linguagem;
  dark: boolean;
  readOnly?: boolean;
  height?: string;
}

export default function EditorCodigo({
  value,
  onChange,
  language,
  dark,
  readOnly,
  height = '360px',
}: Props) {
  return (
    <CodeMirror
      value={value}
      height={height}
      style={{ height }}
      theme={dark ? oneDark : 'light'}
      extensions={[EXTENSOES[language]]}
      readOnly={readOnly}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: !readOnly,
        autocompletion: true,
        tabSize: 2,
      }}
    />
  );
}
