import logging
import os

from flask import Flask

from config import CONFIG_MAP
from blueprints.main import main_bp


def create_app():
    env = os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(CONFIG_MAP.get(env, CONFIG_MAP["development"]))

    if not app.debug:
        logging.basicConfig(level=logging.INFO)

    app.register_blueprint(main_bp)

    @app.errorhandler(404)
    def not_found(e):
        return "Page not found. <a href='/'>Return home</a>", 404

    @app.errorhandler(500)
    def server_error(e):
        app.logger.exception("Server error")
        return "Something went wrong. Please try again shortly.", 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))
