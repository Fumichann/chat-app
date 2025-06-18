# Pythonの公式イメージ（3.11）を使う
FROM python:3.11

# コンテナ内の作業ディレクトリを /app に設定
WORKDIR /app

# 今のプロジェクトの中身をすべてコンテナにコピー
COPY . .

# 必要なライブラリ（FlaskやOpenAIなど）をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリ（app.py）を起動するコマンド
CMD ["python", "app.py"]
