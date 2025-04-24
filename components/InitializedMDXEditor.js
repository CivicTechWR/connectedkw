'use client'

import { 
  MDXEditor, 
  headingsPlugin, 
  linkDialogPlugin, 
  linkPlugin, 
  listsPlugin, 
  quotePlugin, 
  codeBlockPlugin, 
  toolbarPlugin, 
  imagePlugin,
  UndoRedo, 
  BoldItalicUnderlineToggles, 
  BlockTypeSelect, 
  CreateLink,
  InsertImage,
  ListsToggle
} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css'
import styles from 'styles/richtexteditor.module.css'


export default function RichTextEditor({ editorRef=null, ...props }) { 

  return (
    <MDXEditor
        className={`${styles.editor}`}
        plugins={[
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          listsPlugin(),
          imagePlugin(),
          quotePlugin(),
          codeBlockPlugin(),
          toolbarPlugin({
            toolbarClassName: styles.toolbar,
            toolbarContents: () => (
              <>
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <InsertImage />
                <ListsToggle />
                <UndoRedo />
              </>
            )
          })
        ]}
        {...props}
        ref={editorRef}
    />
  )
}
