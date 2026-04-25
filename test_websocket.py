# test_websocket.py (create at project root)
import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as ws:
        print("✅ Connected to WebSocket")
        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"📨 {data['sensor']} : {data['value']} | alert: {data['alert']}")

asyncio.run(test())