from fastapi import FastAPI

app = FastAPI(title="WedaLink API")


@app.get("/health")
def health():
    return {"status": "ok"}
