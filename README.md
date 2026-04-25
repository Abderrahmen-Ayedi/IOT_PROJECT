## ⚙️ Setup Instructions
1️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

2️⃣ Run Backend
in root file
```bash
uvicorn backend.main:app --reload --port 8000
```
http://localhost:8000/ API running message
http://localhost:8000/readings  List of all sensor readings
http://localhost:8000/readings/latest  Last value of co2, temp, gas
http://localhost:8000/alerts   List of warnings and criticals
http://localhost:8000/alerts/stats    Count summary

3️⃣ Run simulator
```bash
cd simulator
python simulator.py
```