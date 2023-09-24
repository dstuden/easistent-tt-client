# Easistent timetable client

This client is designed to work with API from <https://v4.vegova.sync.si> (which works 100% of the time and I am very thankful to have access to it).

## Env

| Variable          | Description      |
| ----------------- | ---------------- |
| VITE_BANNER_TITLE | title for banner |
| VITE_APP_TITLE    | app title        |
| VITE_API_PATH     | URL of your API  |

## Running

```bash
docker build -t easistent-tt-client .
```

```bash
docker run -p 8080:80 easistent-tt-client
```
