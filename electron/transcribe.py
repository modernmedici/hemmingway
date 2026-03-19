#!/usr/bin/env python3
"""
Moonshine mic transcriber — streams completed transcript lines as JSON to stdout.
Runs until killed (SIGTERM from Electron main process).
"""
import json
import sys
import time

from moonshine_voice import MicTranscriber, TranscriptEventListener, ModelArch
from moonshine_voice.utils import get_model_path


class JSONListener(TranscriptEventListener):
    def on_line_completed(self, event):
        print(json.dumps({"text": event.line.text}), flush=True)


def main():
    model_path = str(get_model_path("tiny-en"))
    transcriber = MicTranscriber(
        model_path=model_path,
        model_arch=ModelArch.TINY,
    )
    transcriber.add_listener(JSONListener())
    transcriber.start()
    try:
        while True:
            time.sleep(0.1)
    finally:
        transcriber.stop()
        transcriber.close()


if __name__ == "__main__":
    main()
