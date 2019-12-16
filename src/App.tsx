// Import the Slate editor factory.
import { createEditor, Node, Editor, Element, Text } from 'slate';
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react';
import React, { useMemo, useState, ReactElement, useCallback } from 'react';
import styles from './App.module.css';

const CodeElement = (props: Element): ReactElement => <pre {...props.attributes}>{props.children}</pre>;

// Define our own custom set of helpers for active-checking queries.
const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'code',
    });

    return !!match;
  },
};

const DefaultElement = (props: Element) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const withCustom = (editor: Editor) => {
  const { exec } = editor;
  /* eslint-disable-next-line no-param-reassign */
  editor.exec = (command) => {
    if (command.type === 'toggle_bold_mark') {
      console.log('bold mark');
      const isActive = CustomEditor.isBoldMarkActive(editor);
      console.log(isActive);
      Editor.setNodes(editor, { bold: isActive ? null : true }, { match: (n) => Text.isText(n), split: true });
      console.log(editor);
    } else if (command.type === 'toggle_code_block') {
      const isActive = CustomEditor.isCodeBlockActive(editor);
      Editor.setNodes(editor, { type: isActive ? null : 'code' }, { match: (n) => Editor.isBlock(editor, n) });
    } else {
      exec(command);
    }
  };
  return editor;
};

const Leaf = (props: RenderLeafProps) => {
  console.log(props);
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
      {props.children}
    </span>
  );
};

export default function App(): ReactElement {
  const editor = useMemo(() => withCustom(withReact(createEditor())), []);

  const renderElement = useCallback<(props: any) => ReactElement>((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]);

  return (
    <Slate editor={editor} value={value} onChange={(val) => setValue(val)}>
      <Editable
        className={styles.Editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) return;
          switch (event.key) {
            case 'm': {
              event.preventDefault();
              editor.exec({ type: 'toggle_code_block' });
              break;
            }

            case 'b': {
              event.preventDefault();

              editor.exec({ type: 'toggle_bold_mark' });
              break;
            }

            default:
          }
        }}
      />
    </Slate>
  );
}
