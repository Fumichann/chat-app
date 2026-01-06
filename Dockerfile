# Pythonの公式イメージ（3.11）を使う
FROM python:3.11-slim

# 作業ディレクトリを /app に設定
WORKDIR /app

# 依存関係だけ先にコピーしてインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 本番用サーバーをインストール
RUN pip install gunicorn

# プロジェクト全体をコピー
COPY . .

# .envを環境変数に読み込めるようにする（開発用）
ENV PYTHONUNBUFFERED=1

# Renderのポート指定に対応し、gunicornで起動
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT app:app"]
