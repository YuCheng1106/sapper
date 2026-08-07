FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./requirements.txt
COPY plugin/oauth2/requirements.txt ./plugin/oauth2/requirements.txt

RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install -r plugin/oauth2/requirements.txt

COPY . .

RUN addgroup --system sapper \
    && adduser --system --ingroup sapper --home /app sapper \
    && mkdir -p /app/log /app/static/upload \
    && chown -R sapper:sapper /app

USER sapper

EXPOSE 8007

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8007"]
