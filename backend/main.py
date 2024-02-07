from users import models
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine
from users.routes import user_router
from auth.routes import auth_router
from items.routes import item_router

# create tables on sqlite database
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(item_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jolly-moss-07278ea03.4.azurestaticapps.net",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return JSONResponse(
        content={
            "status": "ok",
            "version": "1.0.0.0",
            "serviceId": "696ff962-dc8c-464b-b92d-2ae8a7a82fbf",
            "serviceName": "Brit API Service",
        }
    )
