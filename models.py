from sqlalchemy import Column, Integer, String, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

class Setting(Base):
    __tablename__ = 'setting'
    settingid = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Numeric(8,2))
