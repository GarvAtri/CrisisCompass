import os
import streamlit as st
from dotenv import load_dotenv
from google import genai

# --- Page setup ---
st.set_page_config(page_title="Gemini Q&A", page_icon="✨", layout="centered")

# Load .env locally (fine in Streamlit Cloud too)
load_dotenv()

# Prefer GEMINI_API_KEY; fall back to GOOGLE_API_KEY if needed
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    st.error(
        "API key not found.\n\n"
        "Create a `.env` file in this folder with:\n"
        "GEMINI_API_KEY=YOUR_KEY\n"
    )
    st.stop()

client = genai.Client(api_key=API_KEY)

# Pick a safe default model (you can change this)
DEFAULT_MODEL = "models/gemini-2.5-flash"

# --- UI ---
st.title("Gemini")
st.write("Type a question below and click **Ask**.")

# Optional settings
with st.expander("Settings", expanded=False):
    model = st.text_input("Model", value=DEFAULT_MODEL)
    
question = st.text_area("Your question:", placeholder="Ask me anything…", height=120)

col1, col2 = st.columns([1, 1])
ask = col1.button("Ask")
clear = col2.button("Clear")

if clear:
    st.session_state.pop("last_answer", None)
    st.session_state.pop("last_question", None)
    st.rerun()

if ask:
    if not question.strip():
        st.warning("Type a question first.")
    else:
        with st.spinner("Thinking…"):
            try:
                resp = client.models.generate_content(
                    model=model.strip(),
                    contents=question.strip(),
                )
                answer = (resp.text or "").strip() or "No text returned."
            except Exception as e:
                answer = f"⚠️ Error: {e}"

        st.session_state["last_question"] = question
        st.session_state["last_answer"] = answer

# Show results (persist after reruns)
if "last_answer" in st.session_state:
    st.subheader("Answer")
    st.write(st.session_state["last_answer"])

