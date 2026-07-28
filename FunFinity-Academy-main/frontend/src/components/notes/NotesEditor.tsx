import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  Image as ImageIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Eraser as EraserIcon,
  Download as DownloadIcon,
  Brain as AIIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DrawingCanvas } from './DrawingCanvas';
import { AIAssistant } from './AIAssistant';
import { exportToPDF } from '@/lib/pdf-export';

interface NotesEditorProps {
  initialContent?: string;
  onSave?: (content: string, drawings: string[]) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export function NotesEditor({ 
  initialContent = '', 
  onSave, 
  title = '',
  onTitleChange 
}: NotesEditorProps) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [drawings, setDrawings] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Bold,
      Italic,
      Underline,
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Heading,
      Image,
      CodeBlock.configure({
        lowlight,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const addDrawing = useCallback((drawingDataUrl: string) => {
    setDrawings(prev => [...prev, drawingDataUrl]);
    setShowCanvas(false);
    
    // Insert drawing into editor at current position
    if (editor) {
      editor.chain().focus().insertContent(`<img src="${drawingDataUrl}" alt="User-created drawing from notes editor" class="max-w-md rounded-lg shadow-md my-4" />`).run();
    }
  }, [editor]);

  const handleExportPDF = useCallback(async () => {
    if (!editor) return;
    
    setIsExporting(true);
    try {
      await exportToPDF({
        title,
        content: editor.getHTML(),
        drawings,
        element: document.getElementById('notes-content'),
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  }, [editor, title, drawings]);

  const handleAIAction = useCallback((action: string, result: string) => {
    if (!editor) return;
    
    switch (action) {
      case 'summarize':
        editor.chain().focus().insertContent(`\n\n--- AI Summary ---\n${result}\n\n---`).run();
        break;
      case 'keywords':
        editor.chain().focus().insertContent(`\n\n--- Keywords ---\n${result}\n\n---`).run();
        break;
      case 'diagram':
        editor.chain().focus().insertContent(`\n\n--- Suggested Diagram ---\n${result}\n\n---`).run();
        break;
    }
    setShowAI(false);
  }, [editor]);

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Toggle
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                size="sm"
              >
                <BoldIcon className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                size="sm"
              >
                <ItalicIcon className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={editor.isActive('underline')}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                size="sm"
              >
                <UnderlineIcon className="w-4 h-4" />
              </Toggle>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Toggle
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                size="sm"
              >
                <H1Icon className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                size="sm"
              >
                <H2Icon className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                size="sm"
              >
                <H3Icon className="w-4 h-4" />
              </Toggle>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Toggle
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                size="sm"
              >
                <ListIcon className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                size="sm"
              >
                <OrderedListIcon className="w-4 h-4" />
              </Toggle>
            </div>

            {/* Insert */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button variant="ghost" size="sm" onClick={setLink}>
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={addImage}>
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCanvas(true)}>
                <PaletteIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* AI Assistant */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAI(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              <AIIcon className="w-4 h-4 mr-1" />
              AI
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <CodeIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().clearNodes().run()}>
                <EraserIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <DownloadIcon className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange?.(e.target.value)}
        placeholder="Note Title..."
        className="text-2xl font-bold w-full p-4 border-0 focus:outline-none bg-transparent"
      />

      {/* Editor Content */}
      <div id="notes-content" className="flex-1 bg-card rounded-lg border overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="h-full prose prose-lg max-w-none focus:outline-none p-6 overflow-y-auto"
        />
      </div>

      {/* Drawing Canvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl h-[80vh] max-h-[800px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Drawing Canvas</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCanvas(false)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <DrawingCanvas 
                onSave={addDrawing}
                onCancel={() => setShowCanvas(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistant
          content={editor.getHTML()}
          onAction={handleAIAction}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Auto-save indicator */}
      {onSave && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Auto-saved {drawings.length} drawing(s)
          </span>
          <Button 
            onClick={() => onSave?.(editor.getHTML(), drawings)}
            size="sm"
          >
            Save Note
          </Button>
        </div>
      )}
    </div>
  );
}
