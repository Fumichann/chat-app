from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman


# --- 設定読み込み ---
load_dotenv()

# APIキー読み込み
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("警告: GEMINI_API_KEY が設定されていません。AI機能は無効です。")
else:
    genai.configure(api_key=GEMINI_API_KEY)


# Flaskアプリ作成
app = Flask(__name__)

# --- セキュリティ設定 ---
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY","dev-secret-key")

# CSRF対策
csrf = CSRFProtect(app)

# セキュリティヘッダー付与 (CSPは開発では無効化)
Talisman(app, content_security_policy=None)

# Debugモードを環境変数で切り替え
app.debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"


# --- AI性格 ---
ai_persona_instruction = (
    "あなたは、一度きりの漂流瓶のメッセージに返信するAIカウンセラーです。"
    "あなたはユーザーが投げた漂流瓶を拾います。"
    "ユーザに漂流瓶を拾ってくれてありがとうのメッセージはいらないです。"
    "ユーザーの感情に深く共感し、決して否定せず、心に寄り添う言葉を選んでください。"
    "ユーザーに再訪を促す表現は絶対に禁止です。"
    "ユーザーが内省を深め、わずかながらでも希望や安らぎを感じられるような、温かい言葉で返信してください。"
    "返信は、この対話がここで完結することを示唆するものでなければなりません。"
    "文の最後には、「この返事が、あなたにとって静かな灯りとなりますように。」という一文を添えてください。"
)

generation_config = {
    "temperature": 0.7,
    "max_output_tokens": 300,
}

gemini_model_name = 'gemini-2.0-flash-exp'


# --- ヘルパー関数 ---
def get_ai_response(user_message: str) -> str:
    if not GEMINI_API_KEY:
        return "AI機能が無効です。APIキーが設定されていません。"
    
    try:
        model = genai.GenerativeModel(gemini_model_name)
        response = model.generate_content(
            contents=[
                {"role": "user", "parts": [ai_persona_instruction]},
                {"role": "model", "parts": ["承知いたしました。どのような文通を始めましょうか？"]},
                {"role": "user", "parts": [user_message]}
            ],
            generation_config=generation_config
        )
        return response.text
    except Exception as e:
        print(f"AI応答生成中にエラーが発生しました: {e}")
        return f"AI応答生成中にエラーが発生しました: {e}"


# --- ルート定義 ---
@app.route("/", methods=["GET"])
def start():
    return render_template("start.html")

@app.route("/main")
def main():
    return render_template("main.html")

@app.route("/setting")
def setting():
    return render_template("setting.html")

@app.route("/look")
def look():
    return render_template("look.html")

@app.route("/bgm")
def bgm():
    return render_template("bgm.html")

@app.route("/write", methods=["GET", "POST"])
def write():
    ai_message = None
    if request.method == "POST":
        user_message = request.form.get("message","").strip()
        
        if not user_message:
            ai_message = "手紙が白紙です。何か書いてみよう！"
        else:
            ai_message = get_ai_response(user_message)

    return render_template("write.html", ai_message=ai_message)

@app.route("/api/reply", methods=["POST"])
@csrf.exempt
def api_reply():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply":"手紙が白紙です。何か書いてみよう！"})

    ai_message = get_ai_response(user_message)
    return jsonify({"reply": ai_message})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)