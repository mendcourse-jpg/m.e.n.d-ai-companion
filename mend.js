const chatInput = document.getElementById("chat-input");
const chatButton = document.getElementById("chat-button");
const chatBox = document.getElementById("chat-box");

// 🔐 Your HuggingFace API key
const HF_TOKEN = "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";

// 🔁 Send message to HuggingFace model
async function sendMessageToAI(message) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B-Instruct",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: message,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("API Error: " + response.status);
        }

        const result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            return result[0].generated_text;
        }

        return "I'm here mama, but something glitched — try again.";

    } catch (error) {
        console.error(error);
        return "Something glitched mama — try again.";
    }
}

// 🗨️ Display messages
function addMessage(role, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = role === "user" ? "user-message" : "ai-message";
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ▶️ When user clicks send
chatButton.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage("user", message);
    chatInput.value = "";

    const reply = await sendMessageToAI(message);
    addMessage("ai", reply);
});

// ▶️ Also send when pressing enter
chatInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        chatButton.click();
    }
});
