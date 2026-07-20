import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Undo,
  Redo,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { streamStudyAssistant } from "@/lib/ai-study-assistant";
import { useStudentPreferences } from "@/hooks/use-student-preferences";
import { toast } from "sonner";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const { preferences } = useStudentPreferences();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleAiAction = async (action: "summarize" | "expand" | "explain" | "improve") => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    const textToProcess = selectedText || editor.getText();
    if (!textToProcess.trim()) {
      toast.error("Please enter some text or select a portion to process.");
      return;
    }

    setIsAiLoading(true);
    let aiResponse = "";

    const promptMap = {
      summarize: "Summarize this content clearly and concisely:",
      expand: "Expand on these ideas with more detail and examples:",
      explain: "Explain this concept in simple terms for a student:",
      improve: "Improve the clarity and flow of this writing:",
    };

    try {
      await streamStudyAssistant({
        type: "chat",
        messages: [
          {
            role: "user",
            content: `${promptMap[action]}\n\n${textToProcess}`,
          },
        ],
        onDelta: (chunk) => {
          aiResponse += chunk;
        },
        onDone: () => {
          if (selectedText) {
            editor.chain().focus().insertContent(aiResponse).run();
          } else {
            editor.chain().focus().insertContent(`\n\n### AI Assistant:\n${aiResponse}`).run();
          }
          setIsAiLoading(false);
          toast.success("AI processing complete!");
        },
        onError: (err) => {
          toast.error(err);
          setIsAiLoading(false);
        },
      });
    } catch (error) {
      toast.error("AI Assistant failed to respond.");
      setIsAiLoading(false);
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col w-full border border-border/30 rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/20 bg-secondary/20">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <div className="flex items-center gap-1 px-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors",
              isAiLoading && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleAiAction("summarize")}
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            Summarize
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors",
              isAiLoading && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleAiAction("improve")}
          >
            Clarity
          </Button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none focus:outline-none"
      />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all disabled:opacity-30",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-border/20 mx-1" />;
}
