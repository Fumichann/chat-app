import os
from flask import Flask, request
from dotenv import load_dotenv
import openai

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form.get("message", "")

    if not user_input:
        return "No message provided", 400

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_input}]
    )

    reply = response.choices[0].message.content.strip()
    return reply

@app.route("/")
def hello():
    return "Hello! POST to /chat with a message to talk to the AI."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
