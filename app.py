from flask import Flask, render_template, request
import openai
import os
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    ai_message = None
    if request.method == "POST":
        user_message = request.form["message"]
        # OpenAI APIを呼び出すコード
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_message}]
        )
        ai_message = response.choices[0].message.content
    return render_template("index.html", ai_message=ai_message)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)

