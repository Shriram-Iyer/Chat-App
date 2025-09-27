from mongoengine import connect

from config.config import MONGO_URI


def init_mongoengine():
    connect(host=MONGO_URI)
    print("Connected to MongoDB with MongoEngine", flush=True)
