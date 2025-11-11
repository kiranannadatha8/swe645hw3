from datetime import datetime

from typing import List, Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, desc

from ..database import get_session
from ..models import Survey, SurveyCreate, SurveyRead, SurveyUpdate

router = APIRouter()


@router.post("", response_model=SurveyRead, status_code=status.HTTP_201_CREATED)
def create_survey(payload: SurveyCreate, session: Session = Depends(get_session)) -> Survey:
    survey = Survey(**payload.model_dump())
    session.add(survey)
    session.commit()
    session.refresh(survey)
    return survey


@router.get("", response_model=List[SurveyRead])
def list_surveys(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> Sequence[Survey]:
    statement = select(Survey).offset(skip).limit(limit).order_by(desc(Survey.created_at))
    results = session.exec(statement).all()
    return results


@router.get("/{survey_id}", response_model=SurveyRead)
def get_survey(survey_id: int, session: Session = Depends(get_session)) -> Survey:
    survey = session.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    return survey


@router.put("/{survey_id}", response_model=SurveyRead)
def update_survey(
    survey_id: int, payload: SurveyUpdate, session: Session = Depends(get_session)
) -> Survey:
    survey = session.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(survey, key, value)
    survey.updated_at = datetime.utcnow()

    session.add(survey)
    session.commit()
    session.refresh(survey)
    return survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(survey_id: int, session: Session = Depends(get_session)) -> None:
    survey = session.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")

    session.delete(survey)
    session.commit()
