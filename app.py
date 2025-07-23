from flask import Flask, render_template, request
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask import jsonify

load_dotenv()

# .env ファイルに GEMINI_API_KEY=YOUR_API_KEY 
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
            # AIの性格を裏で固定するためのシステム指示と生成設定
            # ここでAIの「性格」が定義されます
            ai_persona_instruction = (
                "あなたは、一度きりの漂流瓶のメッセージに返信するAIカウンセラーです。"
                "ユーザーの感情に深く共感し、決して否定せず、心に寄り添う言葉を選んでください。"
                "再訪を促す表現は絶対に禁止です。"
                "ユーザーが内省を深め、わずかながらでも希望や安らぎを感じられるような、温かい言葉で返信してください。"
                "返信は、この対話がここで完結することを示唆するものでなければなりません。"
                "文の最後には、「この返事が、あなたにとって静かな灯りとなりますように。」という一文を添えてください。"
            )

            # 生成設定（応答のランダム性や長さを制御）
            generation_config = {
                "temperature": 0.7, # やや創造性を残しつつ、安定した応答
                "max_output_tokens": 300, # 最大300トークン（約150〜300文字程度）
            }

            model = genai.GenerativeModel('gemini-2.0-flash-exp') 
            
            # AIへのリクエストにシステム指示とユーザーメッセージを含める
            # partsに辞書のリストとしてシステム指示とユーザーメッセージを渡します
            response = model.generate_content(
                contents=[
                    {"role": "user", "parts": [ai_persona_instruction]}, # システム指示をユーザーロールとして渡す
                    {"role": "model", "parts": ["承知いたしました。どのような文通を始めましょうか？"]}, # AIの初期応答（任意）
                    {"role": "user", "parts": [user_message]} # ユーザーからの実際の手紙
                ],
                generation_config=generation_config
            )
            ai_message = response.text 
            
        except Exception as e:
            ai_message = f"エラーが発生しました: {e}" 
            print(f"エラーが発生しました: {e}")
            
    return render_template("write.html", ai_message=ai_message)

@app.route("/api/reply", methods=["POST"])
def api_reply():
    data = request.get_json()
    user_message = data.get("message", "")

    try:
        # AIの性格を裏で固定するためのシステム指示と生成設定 (write関数と同じものを適用)
        ai_persona_instruction = (
                "あなたは、一度きりの漂流瓶のメッセージに返信するAIカウンセラーです。"
                "ユーザーの感情に深く共感し、決して否定せず、心に寄り添う言葉を選んでください。"
                "再訪を促す表現は絶対に禁止です。"
                "ユーザーが内省を深め、わずかながらでも希望や安らぎを感じられるような、温かい言葉で返信してください。"
                "返信は、この対話がここで完結することを示唆するものでなければなりません。"
                "文の最後には、「この返事が、あなたにとって静かな灯りとなりますように。」という一文を添えてください。"

        )

        generation_config = {
            "temperature": 0.7,
            "max_output_tokens": 300,
        }

        # Gemini モデルで返答を生成
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(
            contents=[
                {"role": "user", "parts": [ai_persona_instruction]},
                {"role": "model", "parts": ["承知いたしました。どのような文通を始めましょうか？"]},
                {"role": "user", "parts": [user_message]}
            ],
            generation_config=generation_config
        )
        ai_message = response.text
        
    except Exception as e:
        ai_message = f"エラーが発生しました: {e}"
        print(f"エラーが発生しました: {e}")

    return jsonify({"reply": ai_message})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
