// mend.js — paste this entire file (replace token only)
const messagesDiv = document.getElementById("messages");
const inputEl = document.getElementById("userInput");

// Put your Hugging Face token here (keep the quotes)
const HF_TOKEN = "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";

// helper to show messages
function addMessage(text, sender) {
  const el = document.createElement("div");
  el.className = "msg " + (sender === "me" ? "me" : "bot");
  el.innerText = text;
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send text to Hugging Face inference endpoint
async function sendToHF(text) {
  try {
    const resp = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        })
      }
    );

    if (!resp.ok) {
      // return an error string with status so we can debug
      return `__ERROR__HTTP_${resp.status}`;
    }

    const data = await resp.json();

    // Hugging Face responses vary by model — try common places for the text
    // 1) array with generated_text
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
    // 2) object with generated_text
    if (data?.generated_text) return data.generated_text;
    // 3) some inference endpoints return an "generated_text" inside result or outputs
    if (data?.outputs?.[0]?.generated_text) return data.outputs[0].generated_text;
    // 4) older/other endpoints might return output_text
    if (data?.output_text) return data.output_text;
    // 5) sometimes text is nested in choices
    if (data?.choices?.[0]?.text) return data.choices[0].text;
    if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content;

    // fallback: stringify a little so we can see the shape
    return "__ERROR__NO_TEXT__" + JSON.stringify(data).slice(0, 300);
  } catch (err) {
    return "__ERROR__EXCEPTION__" + (err.message || err.toString());
  }
}

// handler when user sends a message
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage(text, "me");
  inputEl.value = "";
  addMessage("Hold on mama, let me think…", "bot");

  const reply = await sendToHF(text);

  // remove the "thinking" message (last one)
  const last = messagesDiv.lastChild;
  if (last && last.innerText && last.innerText.includes("Hold on mama")) {
    last.remove();
  }

  // error markers start with __ERROR__ so we can act on them
  if (typeof reply === "string" && reply.startsWith("__ERROR__")) {
    // show friendly text but also include short error for debugging
    addMessage("I'm here mama — something glitched. Try again. (" + reply + ")", "bot");
  } else {
    addMessage(reply, "bot");
  }
}

// bind Enter key on input
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
