from celery import Celery
import os
import time

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("analytics_worker", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task
def process_dataset_ml_task(dataset_id: int):
    # Simulate heavy machine learning computation
    time.sleep(2)
    return {
        "dataset_id": dataset_id,
        "status": "COMPLETED",
        "accuracy": 0.942,
        "anomalies_detected": 3
    }
