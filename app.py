from flask import Flask, render_template, request
import google.generativeai as genai # インポートを変更
import os
from dotenv import load_dotenv
from flask import jsonify

load_dotenv()

# Gemini APIキーを設定します
# .env ファイルに GEMINI_API_KEY=YOUR_API_KEY があることを確認してください
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def start():
    return render_template("start.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/setting")
def setting():
    return render_template("setting.html")

@app.route("/look")
def look():
    return render_template("look.html")


@app.route("/write", methods=["GET", "POST"])
def write():
    ai_message = None
    if request.method == "POST":
        user_message = request.form["message"]
        
        try:
            # Generative モデルを初期化します ('gemini-pro-vision'などのマルチモーダルモデルも選択できます)
            model = genai.GenerativeModel('gemini-2.0-flash-exp') 
            
            # Gemini APIを呼び出します
            response = model.generate_content(user_message)
            
            # レスポンスからコンテンツを抽出します
            # Geminiのレスポンス構造はOpenAIとは異なります
            ai_message = response.text 
            
        except Exception as e:
            ai_message = f"エラーが発生しました: {e}" # API呼び出しで発生する可能性のあるエラーを処理します
            print(f"エラーが発生しました: {e}")
            
    return render_template("write.html", ai_message=ai_message)

@app.route("/api/reply", methods=["POST"])
def api_reply():
    data = request.get_json()
    user_message = data.get("message", "")

    try:
        # Gemini モデルで返答を生成
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(user_message)
        ai_message = response.text
    except Exception as e:
        ai_message = f"エラーが発生しました: {e}"
        print(f"エラーが発生しました: {e}")

    return jsonify({"reply": ai_message})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
