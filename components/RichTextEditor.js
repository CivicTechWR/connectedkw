import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { stateToMarkdown } from 'draft-js-export-markdown'
import { stateFromMarkdown } from 'draft-js-import-markdown'

import dynamic from 'next/dynamic';
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(mod => mod.Editor),
  { ssr: false }
) 
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

export default function RichTextEditor({editorState, handleEditorStateChange}) {
  return(
    <Editor
        initialEditorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        wrapperClassName="w-full"
        editorClassName="px-3 min-h-[200px]"
        toolbar={{
        options: ['inline', 'blockType', 'list', 'link', 'emoji', 'history'],
        inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough'],
        },
        blockType: {
            options: ['Normal', 'H2', 'H3', 'H4', 'Blockquote'],
        },
        list: {
            options: ['unordered', 'ordered'],
        },
        }}
    />
  )
}