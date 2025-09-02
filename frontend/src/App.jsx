import { useState } from "react";
import axios from "axios";
import { RefreshCw, X, Send, BotMessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [messages, setMessages] = useState(
    [
      { role: "assistant", 
        content: "Hello! How can I assist you today?" 
      }
    ]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString("en-US", options);


  const handleRefresh = () => {
    setMessages([
      { role: "assistant", content: "Hello! How can I assist you today?" }
    ]);
    setInput("");
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };  

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessages]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/query", {
        question: input,
      });

      console.log("Response from backend:", response.data.answer);

      const answer = response.data.answer || "No answer found.";
      const sources = response.data.sources || [];
      console.log("Sources:", sources);
      console.log("Answer:", answer);

      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant",
          content: answer,  
          sources: sources 
        },
      ]);
      console.log("these are the messages: ", messages);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages([
        ...newMessages,
        {content: "Error: Could not reach server." },
      ]);
    } finally {
      setLoading(false);
    }
    console.log("these are the messages: ", messages);

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AnimatePresence> 
      {isOpen && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-full max-w-2xl bg-gray-100 rounded-lg flex flex-col h-[80vh]"
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-md flex flex-col h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between bg-purple-600 text-white rounded-t-lg">
              <h1 className="text-lg font-semibold">Company RAG AI Chat</h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm opacity-75">Powered by LangChain & Ollama3.2</div>
                <RefreshCw onClick={handleRefresh} className="hover:text-purple-500 transition-colors cursor-pointer" />
                <X onClick={handleToggle} className="hover:text-purple-500 transition-colors cursor-pointer" />
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">{formattedDate}</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Sources: {msg.sources.join(", ")}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="mb-3 text-left p-3">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-600">
                    <div className="flex justify-center items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex items-center bg-gray-50 rounded-b-lg">
              <input
                className="flex-1 border rounded-lg px-3 py-2 mr-2 bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a question..."
              />
              <Send onClick={sendMessage} className="hover:text-purple-500 transition-colors cursor-pointer"/>
            </div>
          </div>
        </motion.div>
      )}
      {!isOpen && (
        <motion.div
          key="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 , ease: "easeInOut" }}
          onClick={handleToggle}
          className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors"
        >
          <BotMessageSquare  
            //onClick={handleToggle}
            size={48}
            //className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors"
          />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

export default App;
