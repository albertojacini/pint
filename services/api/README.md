# FastAPI Service (Placeholder)

This directory is a placeholder for the future FastAPI backend service.

## Future Architecture

The FastAPI service will provide:

- **REST API endpoints** for additional backend functionality
- **Background task processing** with Celery or similar
- **Machine learning model serving** if needed
- **Data processing pipelines**
- **Integration with external APIs**

## Getting Started (When Implemented)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload --port 8000
```

## Integration with Next.js

The FastAPI service will be deployed separately and accessed from the Next.js app via HTTP requests or through a unified API gateway.

## Docker Support

A Dockerfile will be provided for containerized deployment:

```bash
docker build -t pint-api .
docker run -p 8000:8000 pint-api
```

## Environment Variables

Required environment variables will be documented here once the service is implemented.
