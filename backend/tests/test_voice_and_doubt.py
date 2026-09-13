"""
Unit and Integration Tests for StudyRot Voice, Talk Mode, and Multi-Modal Doubt Solving.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from fastapi.testclient import TestClient
from main import app
from tts_latex import latex_to_spoken
import tts
import stt
import doubt

client = TestClient(app)


def test_latex_to_spoken_converter():
    # Mirror equation
    res1 = latex_to_spoken(r"$\frac{1}{v} + \frac{1}{u} = \frac{1}{f}$")
    assert "one over v plus one over u equals one over f" in res1

    # Quadratic formula terms & powers
    res2 = latex_to_spoken(r"$x^2 + \sqrt{4}$ with $\theta = 45^\circ$")
    assert "x squared" in res2
    assert "square root of 4" in res2
    assert "theta" in res2
    assert "degrees" in res2

    # Units
    res3 = latex_to_spoken(r"Distance is $15\text{ cm}$ and velocity is $10\text{ m/s}$")
    assert "centimeters" in res3
    assert "meters per second" in res3


def test_health_reports_all_key_flags():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    keys = data["data"]["keys_present"]
    assert "groq" in keys
    assert "tavily" in keys
    assert "supabase" in keys
    assert "google" in keys
    assert "assemblyai" in keys
    assert "fish" in keys
    assert "nvidia" in keys


def test_tts_voices_list():
    res = client.get("/api/tts/voices")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    voices = data["data"]["voices"]
    assert "teacher" in voices
    assert "buddy" in voices
    assert "narrator" in voices


def test_tts_endpoint_empty_text():
    res = client.post("/api/tts", json={"text": "", "voice": "teacher"})
    assert res.status_code == 400


def test_tts_endpoint_synthesis(monkeypatch):
    # Mock synthesize_speech to avoid external API calls during testing
    async def mock_synth(text, voice="teacher"):
        return b"ID3\x03\x00\x00\x00FAKE_MP3_BYTES"

    monkeypatch.setattr("tts.synthesize_speech", mock_synth)

    res = client.post("/api/tts", json={"text": "Hello, welcome to StudyRot!", "voice": "teacher"})
    assert res.status_code == 200
    assert res.headers["content-type"] == "audio/mpeg"
    assert len(res.content) > 10


def test_stt_endpoint_empty_audio():
    res = client.post(
        "/api/stt/sync",
        files={"audio": ("empty.wav", b"", "audio/wav")},
        data={"subject": "Science", "grade": "10"}
    )
    assert res.status_code in (400, 422)


def test_stt_endpoint_transcription(monkeypatch):
    async def mock_transcribe(audio_bytes, context_prompt=""):
        return "Bhai, mirror formula explain karo na"

    monkeypatch.setattr("stt.transcribe_short", mock_transcribe)

    fake_wav = b"RIFF" + b"\x00" * 200 + b"WAVEfmt "
    res = client.post(
        "/api/stt/sync",
        files={"audio": ("speech.wav", fake_wav, "audio/wav")},
        data={"subject": "Science", "grade": "10", "topic": "Optics"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "mirror formula" in data["data"]["transcript"]


def test_doubt_text_resolution_schema():
    # Test solving a known NCERT doubt
    res = client.post("/api/doubt/text", json={
        "question": "What is the mirror formula and Cartesian sign convention for concave mirror?",
        "subject": "Science",
        "grade": 10,
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    sol = data["data"]

    # Verify complete multi-modal schema
    assert "understanding" in sol
    assert "StudyRot Tutor" in sol["understanding"]
    assert "steps" in sol
    assert len(sol["steps"]) >= 2
    assert "text" in sol["steps"][0]
    assert "latex" in sol["steps"][0]
    assert "final_answer" in sol
    assert "diagram_spec" in sol
    assert "type" in sol["diagram_spec"]
    assert "elements" in sol["diagram_spec"]
    assert "graph_spec" in sol
    assert "points" in sol["graph_spec"]
    assert "simulation_3d" in sol
    assert "trellis_prompt" in sol["simulation_3d"]
    assert "common_mistakes" in sol
    assert "next_practice" in sol
    assert "options" in sol["next_practice"]


def test_doubt_3d_endpoint():
    res = client.post("/api/doubt/3d", json={"prompt": "3D model of a concave mirror"})
    assert res.status_code == 200
    data = res.json()
    assert "ok" in data


def test_talk_websocket_ping():
    with client.websocket_connect("/ws/talk") as ws:
        ws.send_json({"type": "ping"})
        resp = ws.receive_json()
        assert resp["type"] == "pong"


def test_talk_websocket_text_query(monkeypatch):
    async def mock_synth(text, voice="teacher"):
        return b"FAKE_AUDIO"

    monkeypatch.setattr("tts.synthesize_speech", mock_synth)

    with client.websocket_connect("/ws/talk") as ws:
        ws.send_json({
            "type": "text_query",
            "text": "What is Ohm's law?",
            "subject": "Science",
            "grade": 10,
            "voice": "teacher",
        })
        transcript_msg = ws.receive_json()
        assert transcript_msg["type"] == "transcript"
        assert "Ohm's law" in transcript_msg["text"]

        response_msg = ws.receive_json()
        assert response_msg["type"] == "response_text"
        assert len(response_msg["text"]) > 0

        # Receive at least one response_audio or done
        next_msg = ws.receive_json()
        assert next_msg["type"] in ("response_audio", "done")
