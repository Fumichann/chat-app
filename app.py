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
    # APIキーが設定されている場合のみ設定を試みる
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"警告: Gemini APIの設定中にエラーが発生しました: {e}")
        # APIキーがあっても設定失敗したら機能は無効化
        GEMINI_API_KEY = None


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


# --- AI性格 (安全ポリシー考慮版) ---
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

# 最新の安定版モデルを使用
gemini_model_name = 'gemini-2.5-flash-preview-09-2025'


# --- ヘルパー関数 ---
def get_ai_response(user_message: str) -> str:
    """ユーザーメッセージに基づいてAI応答を生成する（エラー処理強化版）"""
    if not GEMINI_API_KEY:
        return "APIキーが設定されていません。AI機能は無効です。"
    
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

        # 1. 候補が一つでも存在するかチェック (AIが何も生成しなかった場合)
        if not response.candidates:
            # 候補がない場合、プロンプトフィードバックを確認
            finish_reason = response.prompt_feedback.block_reason.name if response.prompt_feedback and response.prompt_feedback.block_reason else "UNKNOWN"
            if finish_reason != "UNKNOWN": # ブロックされた明確な理由がある場合
                 print(f"AI応答がプロンプトによりブロックされました。理由コード: {finish_reason}")
                 return "いただいたメッセージは、当サービスが定める安全基準に照らし、応答を生成できませんでした。内容を少し変えて、心に負担のない範囲でお送りください。"
            return "AIからの応答が取得できませんでした。（候補なし）"

        # 2. 応答が安全ポリシーによりブロックされていないか確認
        candidate = response.candidates[0]
        if candidate.finish_reason.name == 'SAFETY':
            # 安全ポリシーによるブロック
            print(f"AI応答が安全ポリシーによりブロックされました。理由コード: {candidate.safety_ratings}")
            return "いただいたメッセージは、当サービスが定める安全基準に照らし、応答を生成できませんでした。内容を少し変えて、心に負担のない範囲でお送りください。"
        
        # 3. テキストを返す（ここで response.text に安全にアクセスできます）
        return response.text
        
    except Exception as e:
        error_message = str(e)
        print(f"AI応答生成中にエラーが発生しました: {error_message}")
        
        # 429 (クォータ超過) エラーの場合
        if "429" in error_message or "Quota exceeded" in error_message:
            return "現在、AIの利用が集中しています。無料枠の制限を超過した可能性があります。しばらく時間をおいてから、再度お試しください。"

        # その他のAPIエラーの場合
        return f"AI応答生成中に予期せぬエラーが発生しました。"


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

@app.route("/write", methods=["GET"])
def write():
    return render_template("write.html", ai_message=None)

@app.route("/api/reply", methods=["POST"])
@csrf.exempt
def api_reply():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply":"手紙が白紙です。何か書いてみよう！"})

    # AI応答を取得（エラー処理は get_ai_response 関数内で行われる）
    ai_message = get_ai_response(user_message)
    
    # 応答をJSONで返す
    return jsonify({"reply": ai_message})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)