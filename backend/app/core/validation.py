from pydantic import BaseModel, ConfigDict, model_validator


class RequestModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class UpdateRequestModel(RequestModel):
    @model_validator(mode="before")
    @classmethod
    def reject_required_nulls(cls, values):
        nullable = {"estimated_price", "image_url", "notes"}
        if isinstance(values, dict):
            for field, value in values.items():
                if value is None and field not in nullable:
                    raise ValueError(f"{field} cannot be null")
        return values
