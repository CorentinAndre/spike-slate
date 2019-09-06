import React, { useState } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import ReactJson from 'react-json-view';
import '@ornikar/kitt/dist/kitt-default.css';
import {Typography} from '@ornikar/kitt';
import './App.css';

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
})

const MarkHotkey = options => {
  const {type, key} = options;

  return {
    onKeyDown: (event, editor, next) => {
      console.log('onKeyDown')
      if (!event.ctrlKey || event.key !== key) return next()
      console.log('is ctrl')
      // Prevent the default characters from being inserted.
      event.preventDefault()

      // Toggle the mark `type`.
      editor.toggleMark(type)
    }
  }
}

const BlockHotkey = options => {
  const { type, key } = options;

  return {
    onKeyDown: (event, editor, next) => {
      if(!event.metaKey || event.key != key) return next();

      event.preventDefault();
      const isAlreadyBlock = editor.value.blocks.some(block => block.type === type);
      editor.setBlocks(isAlreadyBlock ? 'paragraph' : type);
    } 
  }
}

const codePlugin = BlockHotkey({
  type: 'code',
  key: 'm'
})

const boldPlugin = MarkHotkey({
  type: 'bold',
  key: 'b',
});

const italicPlugin = MarkHotkey({
  type: 'italic',
  key: 'i',
});

const plugins = [italicPlugin, boldPlugin, codePlugin];

const CodeNode = ({children, attributes }) => <pre {...attributes}><code>{children}</code></pre>

const BoldMark = ({ children }) => <strong>{children}</strong>
const ItalicMark = ({children}) => <i>{children}</i>

const renderBlock = (props, editor, next) => {
  switch (props.node.type) {
    case "code":
      return <CodeNode {...props} />
    case "paragraph":
      return <Typography.div>{props.children}</Typography.div>
    default:
      return next();
  }
}

const renderMark = (props, editor, next) => {
  switch (props.mark.type) {
    case "bold":
      return <Typography.span variant="bold">{props.children}</Typography.span>
    case "italic":
      return <ItalicMark {...props} />
    default:
      return next();
  }
}

function App() {
  const [editorValue, setEditorValue] = useState(initialValue);

  const onEditorChange = ({value}) => setEditorValue(value);


  return (
    <div className="App">
      <Editor 
        className="Editor"
        plugins={plugins}
        onChange={onEditorChange} 
        value={editorValue}
        renderBlock={renderBlock}
        renderMark={renderMark}
      />
      <div className="ValuePreviewer"><ReactJson src={editorValue.toJSON()}/></div>
    </div>
  );
}

export default App;
