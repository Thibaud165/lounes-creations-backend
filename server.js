const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); // autoriser CORS pour toutes les origines (à sécuriser ensuite)
app.use(express.json({ limit: "10mb" })); // pour recevoir les gros fichiers base64

// Crée le dossier commandes s'il n'existe pas
const commandesDir = path.join(__dirname, "commandes");
if (!fs.existsSync(commandesDir)) {
  fs.mkdirSync(commandesDir);
}

app.post("/api/commande", (req, res) => {
  const { image, produit, nomClient, date } = req.body;

  if (!image || !produit || !nomClient || !date) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  // Extraire base64 (supprime le préfixe data:image/png;base64,)
  const base64Data = image.replace(/^data:image\/png;base64,/, "");

  // Génère un nom de fichier unique
  const fileName = `commande_${Date.now()}.png`;
  const filePath = path.join(commandesDir, fileName);

  // Sauvegarde l'image PNG
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Erreur sauvegarde image:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    // Sauvegarde les infos dans un JSON
    const infoCommande = {
      produit,
      nomClient,
      date,
      imageFile: fileName,
    };

    const jsonPath = path.join(commandesDir, `commande_${Date.now()}.json`);
    fs.writeFile(jsonPath, JSON.stringify(infoCommande, null, 2), (err) => {
      if (err) {
        console.error("Erreur sauvegarde JSON:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      res.json({ message: "Commande reçue et sauvegardée" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
