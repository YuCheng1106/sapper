from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str
    WEBSOCKET_ROUTE: str
    API_V1_STR: str
    DATABASE_URL: str
    SECRET_KEY: str
    SECRET_ID: str
    REGION: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_MINUTES: int
    OPENAI_MODEL: str
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    OPENAI_KEY: str
    WKHTMLTOPDF = str
    WKHTMLTOIMAGE = str
    #
    class Config:
        env_file = ".env"


settings = Settings()

