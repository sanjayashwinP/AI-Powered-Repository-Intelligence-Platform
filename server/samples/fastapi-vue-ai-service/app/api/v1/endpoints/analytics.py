from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.tasks.celery_app import process_dataset_ml_task

router = APIRouter()

class JobResponse(BaseModel):
    job_id: str
    status: str
    dataset_id: int

@router.post("/trigger", response_model=JobResponse)
def trigger_analysis(dataset_id: int):
    task = process_dataset_ml_task.delay(dataset_id)
    return JobResponse(
        job_id=str(task.id),
        status="QUEUED",
        dataset_id=dataset_id
    )

@router.get("/status/{job_id}")
def check_job_status(job_id: str):
    from celery.result import AsyncResult
    from app.tasks.celery_app import celery_app
    res = AsyncResult(job_id, app=celery_app)
    return {
        "job_id": job_id,
        "status": res.status,
        "result": res.result if res.ready() else None
    }
