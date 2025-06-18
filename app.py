from flask import Flask, render_template, request
import openai

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    ai_message = None
    if request.method == "POST":
        user_message = request.form["message"]
        # OpenAIに送る（仮：あとでちゃんと書く）
        ai_message = "これはAIからの返信です（ここをあとでChatGPTに）"
    return render_template("index.html", ai_message=ai_message)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

