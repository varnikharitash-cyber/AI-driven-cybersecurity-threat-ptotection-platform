from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import warnings

# Suppress warnings
import sys
if sys.version_info < (3, 10):
    try:
        import importlib.metadata
        import importlib_metadata
        if not hasattr(importlib.metadata, "packages_distributions"):
            importlib.metadata.packages_distributions = importlib_metadata.packages_distributions
    except ImportError:
        pass

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from src.routers import dashboard, analysis, chat

app = FastAPI(title="CyberSpy API", description="Modular Threat Detection Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(dashboard.router, prefix="/api", tags=["Legacy/Stream"]) # Map /ws/stream and /network to root api namespace if needed or keep structure
app.include_router(dashboard.router, prefix="", tags=["Root Stream"]) 
app.include_router(analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
def health_check():
    return {"status": "CyberSpy Core Active", "version": "2.0.0"}

# Re-map legacy routes to keep frontend compatible without major refactor
# Frontend expects:
# /api/dashboard/stats -> (handled by first include)
# /api/network/scan -> (handled by dashboard router under /api/network because I added it there)
# /api/analyze/file -> (handled by analysis router)
# /ws/stream -> (handled by dashboard router)
