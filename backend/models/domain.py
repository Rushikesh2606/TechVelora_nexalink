from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TrustSignal(BaseModel):
    name: str
    weight: float
    status: bool

class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    role: str = "individual"
    trustScore: float = 0
    trustBadge: str = "NEW"
    headline: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    experienceYears: int = 0
    connectionsCount: int = 0
    postsCount: int = 0
    emailVerified: bool = False
    createdAt: Optional[Any] = None

class Post(BaseModel):
    postId: str
    authorId: str
    authorType: str = "user"
    authorName: str
    authorTrustBadge: str = "NEW"
    content: str
    postType: str = "update"
    mediaUrl: Optional[str] = None
    likesCount: int = 0
    commentsCount: int = 0
    repostsCount: int = 0
    createdAt: Optional[Any] = None

class Job(BaseModel):
    jobId: str
    companyId: str
    companyName: str
    title: str
    description: str
    location: str
    type: str = "full-time"
    requiredExperienceYears: int = 1
    requiredSkills: List[str] = []
    salary: Optional[str] = None
    status: str = "open"
    createdAt: Optional[Any] = None

class Event(BaseModel):
    eventId: str
    organizerId: str
    title: str
    description: str
    type: str = "workshop"
    location: str
    date: Optional[Any] = None
    maxAttendees: int = 100
    attendeesCount: int = 0
    createdAt: Optional[Any] = None
