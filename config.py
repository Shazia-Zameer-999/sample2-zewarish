import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-in-production")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
    JSON_SORT_KEYS = False
    TEMPLATES_AUTO_RELOAD = os.environ.get("FLASK_ENV") == "development"
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
