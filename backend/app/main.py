from fastapi import FastAPI

app = FastAPI(title="Apex Gadgets Support Agent")


@app.get("/health")
def health_check():
    return {"status": "ok"}
