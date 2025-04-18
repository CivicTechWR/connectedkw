'use client'

import dynamic from 'next/dynamic'
import { forwardRef } from "react"

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import('components/InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false
})

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
const RichTextEditor = forwardRef((props, ref) => <Editor {...props} editorRef={ref} />)

export default RichTextEditor