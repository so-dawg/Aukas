# Controllers

Request handlers. Each controller receives an Express `req`/`res`, calls into models or services, and returns a JSON response.

Keep business logic here; keep SQL in `models/`.
