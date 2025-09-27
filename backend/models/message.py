from datetime import datetime, UTC

from mongoengine import Document, ReferenceField, StringField, DateTimeField


class Message(Document):
    sender = ReferenceField('User', required=True)
    receiver = ReferenceField('User', required=True)
    text = StringField()
    image = StringField()
    video = StringField()
    created_at = DateTimeField(default=lambda: datetime.now(UTC))
    updated_at = DateTimeField(default=lambda: datetime.now(UTC))

    meta = {
        'collection': 'message'
    }

    def create(self, *args, **kwargs):
        """
        Create or save the friend request document. Sets updated_at and handles errors.
        """
        self.updated_at = datetime.now(UTC)
        try:
            return super(Message, self).save(*args, **kwargs)
        except Exception as e:
            print(f"Error creating friend request: {e}")
            return None

    def update_request(self, **kwargs):
        """
        Partially update friend request fields. Only fields provided in kwargs are updated.
        Automatically updates updated_at.
        Returns the updated friend request object, or None on error.
        """
        update_fields = {}
        for field, value in kwargs.items():
            update_fields[f"set__{field}"] = value
        update_fields["set__updated_at"] = datetime.now(UTC)
        try:
            updated_count = Message.objects(id=self.id).update(**update_fields)
            if updated_count:
                return Message.objects(id=self.id).first()
            else:
                return None
        except Exception as e:
            print(f"Error updating friend request: {e}")
            return None

    def to_dict(self):
        try:
            return {
                "_id": str(self.id) if self.id else None,
                "sender": str(self.sender.id) if self.sender else None,
                "receiver": str(self.receiver.id) if self.receiver else None,
                "text": self.text,
                "image": self.image,
                "video": self.video,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "updated_at": self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"Error serializing friend request to dict: {e}")
            return {}

    @staticmethod
    def from_dict(data):
        try:
            return Message(
                sender=data.get("sender"),
                receiver=data.get("receiver"),
                text=data.get("text"),
                image=data.get("image"),
                video=data.get("video"),
                created_at=data.get("created_at", datetime.now(UTC)),
                updated_at=data.get("updated_at", datetime.now(UTC))
            )
        except Exception as e:
            print(f"Error creating friend request from dict: {e}")
            return None
