import os
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
from dotenv import load_dotenv
from html.parser import HTMLParser
import csv
import heapq

import torch
from transformers import BertTokenizer, BertForSequenceClassification

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY")
BASE_URL = 'https://www.googleapis.com/youtube/v3/commentThreads'

# Load BERT model
MODEL_DIR = Path.cwd() / "final_model"
try:
    tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
    model = BertForSequenceClassification.from_pretrained(MODEL_DIR)
    model.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
except Exception as e:
    raise RuntimeError(f"Failed to load BERT model or tokenizer: {e}")

comment_map = {
    "positive": [],
    "negative": [],
    "neutral": []
}

top_comments = []

def update_top_comments(sentiment, comment, likes):
    heap = comment_map[sentiment]
    heapq.heappush(heap, (likes, comment))
    if len(heap) > 50:
        heapq.heappop(heap)

def update_global_top_comments(comment: str, likes: int):
    global top_comments
    top_comments.append({"comment": comment, "likes": likes})
    top_comments = sorted(top_comments, key=lambda x: x["likes"], reverse=True)[:10]

class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = ""

    def handle_data(self, data):
        self.text += data

def extract_text_from_html(html):
    stripper = HTMLStripper()
    stripper.feed(html)
    return stripper.text.strip()

async def fetch_comments(video_id: str, max_comments: int = 10000):
    comments = []
    next_page_token = ""

    while len(comments) < max_comments:
        params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": 100,
            "pageToken": next_page_token,
            "key": API_KEY,
        }
        try:
            response = requests.get(BASE_URL, params=params)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to fetch comments: {e}")
            break

        data = response.json()

        for item in data.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            raw_html = snippet["textDisplay"]
            like_count = snippet.get("likeCount", 0)
            clean_text = extract_text_from_html(raw_html)
            comments.append({"Comment": clean_text, "Likes": like_count})

        next_page_token = data.get("nextPageToken", "")
        if not next_page_token:
            break

    return comments[:max_comments]

async def save_comments_to_csv(comments: List[dict], filepath: str):
    try:
        with open(filepath, mode='w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["Comment", "Likes"])
            writer.writeheader()
            writer.writerows(comments)
    except Exception as e:
        print(f"Error saving CSV: {e}")
        raise HTTPException(status_code=500, detail="Error writing CSV")

@app.get("/")
async def root():
    return {"message": "Backend is running."}

@app.get("/fetch-comments-csv")
async def fetch_comments_csv(videoId: str):
    try:
        comments = await fetch_comments(videoId, max_comments=10000)
        if not comments:
            raise HTTPException(status_code=404, detail="No comments found.")
        await save_comments_to_csv(comments, "comments.csv")
        return {"status": "success", "message": "Comments saved to comments.csv"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

@app.get("/sentiment-analysis")
async def analyze():
    df = pd.read_csv("comments.csv")
    number = [0, 0, 0]  # [negative, neutral, positive]

    comment_map["positive"].clear()
    comment_map["neutral"].clear()
    comment_map["negative"].clear()
    top_comments.clear()  # ✅ clear old top comments

    try:
        for i in range(df.shape[0]):
            input_sentence = df["Comment"][i]
            likes = int(df["Likes"][i])

            inputs = tokenizer(input_sentence, return_tensors="pt", truncation=True, padding=True, max_length=512)
            inputs = {key: val.to(device) for key, val in inputs.items()}

            with torch.no_grad():
                outputs = model(**inputs)
                predicted_class = torch.argmax(outputs.logits, dim=1).item()

            if predicted_class == 0:
                update_top_comments("negative", input_sentence, likes)
                number[0] += 1
            elif predicted_class == 1:
                update_top_comments("neutral", input_sentence, likes)
                number[1] += 1
            elif predicted_class == 2:
                update_top_comments("positive", input_sentence, likes)
                number[2] += 1

            # ✅ Update top global comments
            update_global_top_comments(input_sentence, likes)

        # Pie chart generation
        labels = ['Negative', 'Neutral', 'Positive']
        sizes = number
        colors = ['#FF6347', '#FFD700', '#32CD32']
        explode = (0.1, 0, 0)

        fig, ax = plt.subplots()
        ax.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True, startangle=90)
        ax.axis('equal')

        img_io = io.BytesIO()
        plt.savefig(img_io, format="png")
        img_io.seek(0)

        return StreamingResponse(img_io, media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sentiment analysis: {e}")

@app.get("/positive-feedback")
async def positive_feedback():
    try:
        if not comment_map["positive"]:
            raise HTTPException(status_code=404, detail="No positive comments available.")
        comments = [c for _, c in sorted(comment_map["positive"], reverse=True)]
        prompt = "Summarize what users liked about this video based on the following top positive comments:\n\n" + "\n".join(comments)
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={"model": "mistral", "prompt": prompt, "stream": False}
        )
        return {"feedback": response.json()['response']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating positive feedback: {str(e)}")

@app.get("/negative-feedback")
async def negative_feedback():
    try:
        if not comment_map["negative"]:
            raise HTTPException(status_code=404, detail="No negative comments available.")
        comments = [c for _, c in sorted(comment_map["negative"], reverse=True)]
        prompt = "Provide constructive criticism for the video creator based on these top negative comments:\n\n" + "\n".join(comments)
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={"model": "mistral", "prompt": prompt, "stream": False}
        )
        return {"feedback": response.json()['response']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating negative feedback: {str(e)}")

@app.get("/feedback")
async def feedback():
    try:
        all_comments = (
            [c for _, c in sorted(comment_map["positive"], reverse=True)] +
            [c for _, c in sorted(comment_map["negative"], reverse=True)] +
            [c for _, c in sorted(comment_map["neutral"], reverse=True)]
        )
        if not all_comments:
            raise HTTPException(status_code=404, detail="No comments available.")
        prompt = "Based on the following YouTube comments (positive, negative, and neutral), provide a comprehensive summary and overall feedback for the video creator:\n\n" + "\n".join(all_comments)
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={"model": "mistral", "prompt": prompt, "stream": False}
        )
        return {"feedback": response.json()['response']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating final feedback: {str(e)}")

@app.get("/video-stats")
async def video_stats(videoId: str = Query(..., alias="videoId")):
    try:
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not set in backend.")
        url = f"https://www.googleapis.com/youtube/v3/videos?part=statistics&id={videoId}&key={api_key}"
        response = requests.get(url)
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            stats = data["items"][0]["statistics"]
            return {
                "likeCount": stats.get("likeCount", "N/A"),
                "commentCount": stats.get("commentCount", "N/A")
            }
        else:
            raise HTTPException(status_code=404, detail="Video not found or stats unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching video stats: {str(e)}")

@app.get("/top-comments")
async def get_top_comments():
    print(f"Top comments requested. Current top_comments: {top_comments}")  # Debugging log
    if not top_comments:
        raise HTTPException(status_code=404, detail="No comments available.")
    return top_comments
