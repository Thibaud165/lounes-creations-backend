from flask import Flask, request, jsonify
import base64, os, json
from datetime import datetime

app = Flask(__name__)

@app.route("/api/commande", methods=["POST"])
def recevoir_commande():
    data = request.get_json()
    image_data = data.get("image")
    produit = data.get("produit")
    nom = data.get("nomClient")
    date = data.get("date")

    if not all([image_data, produit, nom, date]):
        return jsonify({"message": "Données manquantes"}), 400

    if not os.path.exists("commandes"):
        os.makedirs("commandes")

    timestamp = int(datetime.now().timestamp())
    img_path = f"commandes/commande_{timestamp}.png"
    json_path = f"commandes/commande_{timestamp}.json"

    # enregistrer l'image
    with open(img_path, "wb") as f:
        f.write(base64.b64decode(image_data.split(",")[1]))

    # enregistrer les infos JSON
    with open(json_path, "w") as f:
        json.dump({
            "produit": produit,
            "nomClient": nom,
            "date": date,
            "imageFile": img_path
        }, f, indent=2)

    return jsonify({"message": "Commande enregistrée ✅"})
