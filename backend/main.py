from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

app = FastAPI(title="Startup Navigator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
    
from auth.routes import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["auth"])


from articles.routes import router as articles_router
app.include_router(articles_router, prefix="/articles", tags=["articles"])

from rag.routes import router as rag_router
app.include_router(rag_router, prefix="/search", tags=["ai-search"])

from search_history.routes import router as search_history_router
app.include_router(search_history_router, prefix="/history", tags=["search-history"])

from admin.routes import router as admin_router
app.include_router(admin_router, prefix="/admin", tags=["admin"])

from resources.routes import router as resources_router
app.include_router(resources_router, prefix="/resources", tags=["resources"])

from contact.routes import router as contact_router
app.include_router(contact_router, prefix="/contact", tags=["contact"]) 


# Routers will be included here as each module is built:
# from auth.routes import router as auth_router
# app.include_router(auth_router, prefix="/auth", tags=["auth"])