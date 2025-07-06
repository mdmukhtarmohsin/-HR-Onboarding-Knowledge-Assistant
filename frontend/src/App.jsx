import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiSend, FiUser, FiCpu } from "react-icons/fi";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        query: input,
      });
      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error getting response from the bot.",
        sender: "bot",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>HR Assistant</h2>
        <div className="upload-section">
          <label htmlFor="file-upload" className="file-upload-label">
            <FiUpload />
            <span>{file ? file.name : "Select a document"}</span>
          </label>
          <input id="file-upload" type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
      <div className="chat-container">
        <header className="App-header">
          <h1>HR Onboarding Knowledge Assistant</h1>
        </header>
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-icon">
                {msg.sender === "user" ? <FiUser /> : <FiCpu />}
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-icon">
                <FiCpu />
              </div>
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask a question about your documents..."
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
