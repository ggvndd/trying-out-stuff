from pydantic import BaseModel, Field

# Pydantic V2 Models for Input/Output validation

class ExampleResponse(BaseModel):
    message: str = Field(..., description="The response message")
    cached: bool = Field(default=False, description="Did this come from Redis?")

class DataItem(BaseModel):
    id: str
    name: str

class ExampleDataResponse(BaseModel):
    items: list[DataItem]
