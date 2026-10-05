from abc import ABC, abstractmethod


class Classifier(ABC):
    @abstractmethod
    def classify(self, text: str) -> dict:
        """Return {'category': str, 'subcategory': str|None, 'confidence': float}"""
