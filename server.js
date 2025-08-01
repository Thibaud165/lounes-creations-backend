const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Prends le port donné par Render (ou 3000 par défaut pour local)
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const commandesDir = path.join(__dirname, "commandes");
if (!fs.existsSync(commandesDir)) {
  fs.mkdirSync(commandesDir);
}

app.post("/api/commande", (req, res) => {
  const { image, produit, nomClient, date } = req.body;
  if (!image || !produit || !nomClient || !date) {
    return res.status(400).json({ message: "Données manquantes" });
  }
  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const timestamp = Date.now();
  const fileName = `commande_${timestamp}.png`;
  const filePath = path.join(commandesDir, fileName);

  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Erreur sauvegarde image:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const infoCommande = {
      produit,
      nomClient,
      date,
      imageFile: fileName,
    };

    const jsonPath = path.join(commandesDir, `commande_${timestamp}.json`);
    fs.writeFile(jsonPath, JSON.stringify(infoCommande, null, 2), (err) => {
      if (err) {
        console.error("Erreur sauvegarde JSON:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      res.json({ message: "Commande reçue et sauvegardée" });
    });
  });
});

// Ici, on écoute bien sur process.env.PORT (ou 3000 par défaut)
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
