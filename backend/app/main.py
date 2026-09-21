from fastapi import FastAPI
from fastapi.responses import JSONResponse
from backend.app.core.errors import DataConflict
from fastapi.middleware.cors import CORSMiddleware

from backend.app.products.router import router as product_router
from backend.app.shopping_lists.router import (
    router as shopping_list_router,
)
from backend.app.categories.router import (
    router as categories_router,
)



def create_app() -> FastAPI:
    app = FastAPI(
        title="Smart Grocery API",
        version="0.1.0",
    )

    @app.exception_handler(DataConflict)
    async def data_conflict_handler(request, error):
        return JSONResponse(status_code=409, content={"detail": str(error)})

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(product_router, prefix="/api", tags=["products"])
    app.include_router(
        shopping_list_router,
        prefix="/api",
        tags=["shopping lists"],
    )
    app.include_router(
            categories_router,
            prefix="/api",
            tags=["categories"],
        )

    return app


app = create_app()


@app.get("/health")
def health_check():
    return {"status": "ok"}
