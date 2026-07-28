import { motion } from "framer-motion";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function AdminMessages() {
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col"
      >
        <div className="mb-6 px-2 flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Platform <span className="text-destructive">Communication</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Universal access to all platform discussions and chats</p>
          </div>
          <div className="hidden md:block px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-wider">
            Admin Unrestricted Access
          </div>
        </div>

        <div className="flex-1 min-h-[500px]">
          <ChatContainer />
        </div>
      </motion.div>
    </div>
  );
}
