from django.views.generic import TemplateView
from django.conf import settings
from pathlib import Path

class ReactAppView(TemplateView):
    """
    Serve the React app for all non-API routes.
    This allows React Router to handle client-side routing.
    """
    template_name = 'index.html'
    
    def get_template_names(self):
        # Try to find the built React index.html
        frontend_dir = Path(settings.BASE_DIR).parent / 'frontend' / 'dist'
        index_path = frontend_dir / 'index.html'
        
        if index_path.exists():
            return ['index.html']
        # Fallback if index.html not found
        return ['index.html']

