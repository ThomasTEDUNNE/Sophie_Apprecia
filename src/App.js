import React, { useState, useRef } from "react";
import "./styles.css"; // Assurez-vous que ce fichier existe et contient vos styles
//Test

const App = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnConfig, setColumnConfig] = useState({});
  const [configuredData, setConfiguredData] = useState([]);
  const [startLine, setStartLine] = useState(1);
  const configuredTableRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsedData = parseCSV(content);
      setData(parsedData);
      setHeaders(parsedData[0]);
      initializeColumnConfig(parsedData[0]);
    };
    reader.readAsText(file);
  };

  const parseCSV = (content) => {
    return content
      .split("\n")
      .map((line) =>
        line.split(";").map((cell) => cell.trim().replace(/^"|"$/g, ""))
      );
  };

  const initializeColumnConfig = (headers) => {
    const config = {};
    headers.forEach((header, index) => {
      config[header] = index === 0 ? "NOM" : "ignore";
    });
    setColumnConfig(config);
  };

  const handleColumnConfigChange = (header, value) => {
    setColumnConfig((prev) => {
      const newConfig = { ...prev };
      newConfig[header] = value;
      return newConfig;
    });
  };

  const calculateAverage = (values) => {
    const validValues = values.filter((v) => !isNaN(parseFloat(v)) && v !== "");
    if (validValues.length === 0) return 0;
    return (
      validValues.reduce((sum, v) => sum + parseFloat(v), 0) /
      validValues.length
    );
  };

  const calculatePresenceRate = (evaluations, tps) => {
    const totalSessions = evaluations.length + tps.length;
    const absences = evaluations
      .concat(tps)
      .filter((v) => ["Abs", "N.Not", "X"].includes(v)).length;
    return (((totalSessions - absences) / totalSessions) * 100).toFixed(2);
  };

  const generateAppreciation = (
    moyenne,
    moyenneTP,
    moyennesEvaluations,
    attendancePercentage,
    moyennesTrimestrielles
  ) => {
    if (attendancePercentage === "0.00") {
      return "Élève absent";
    }

    let appreciation = "";

    // Ajout du commentaire sur l'évolution des moyennes trimestrielles
    if (moyennesTrimestrielles.length >= 2) {
      const dernieresMoyennes = moyennesTrimestrielles.slice(-2);
      const difference = dernieresMoyennes[1] - dernieresMoyennes[0];
      if (Math.abs(difference) >= 2) {
        if (difference > 0) {
          appreciation += `En progression par rapport à la période précédente. `;
        } else {
          appreciation += `Baisse par rapport à la période précédente. `;
        }
      }
    }

    // Appréciations basées sur la moyenne générale
    // Utiliser la moyenne du trimestre le plus récent pour l'appréciation
    const moyenneUtilisee =
      moyennesTrimestrielles.length > 0
        ? moyennesTrimestrielles[moyennesTrimestrielles.length - 1]
        : moyenne;
    if (moyenneUtilisee >= 18) {
      appreciation += "Excellents résultats obtenus sur cette durée. ";
    } else if (moyenneUtilisee >= 14) {
      appreciation += "De bons résultats ont été obtenus sur cette durée. ";
    } else if (moyenneUtilisee >= 12) {
      appreciation += "Des résultats moyens ont été obtenus sur cette durée. ";
    } else if (moyenneUtilisee >= 11) {
      appreciation += "Les résultats obtenus sont fragiles sur cette durée. ";
    } else if (moyenneUtilisee >= 0) {
      appreciation +=
        "Les résultats attendus n'ont pas été atteints sur cette durée. ";
    } else {
      appreciation +=
        "Il y a peu d'évaluation pour juger réellement les résultats obtenus. ";
    }

    // Appréciations basées sur la moyenne TP
    if (moyenneTP !== null) {
      if (moyenneTP >= 18) {
        appreciation += "Excellentes performances dans les activités. ";
      } else if (moyenneTP >= 14) {
        appreciation += "Bonnes performances dans les activités. ";
      } else if (moyenneTP >= 12) {
        appreciation += "Performances moyennes dans les activités. ";
      } else if (moyenneTP >= 8) {
        appreciation += "Performances fragiles dans les activités. ";
      } else if (moyenneTP >= 0) {
        appreciation +=
          "Les attentes dans les activités n'ont pas été atteintes. ";
      }
    } else {
      appreciation += "Aucune note d'activités disponible. ";
    }

    // Conseils basés sur les moyennes
    if (moyennesEvaluations !== null && moyenneTP !== null) {
      if (moyennesEvaluations >= 16 && moyenneTP >= 16) {
        appreciation += "Félicitations pour ton travail. ";
      } else if (moyennesEvaluations >= 16 && moyenneTP >= 14) {
        appreciation +=
          "Investis un peu plus de temps dans les activités pour harmoniser tes résultats.";
      } else if (moyennesEvaluations >= 16 && moyenneTP >= 12) {
        appreciation +=
          "Renforce tes compétences dans les activités pour équilibrer tes résultats et améliorer ton bilan global.";
      } else if (moyennesEvaluations >= 16 && moyenneTP >= 10) {
        appreciation +=
          "Travaille davantage sur les activités pour équilibrer tes résultats.";
      } else if (moyennesEvaluations >= 16 && moyenneTP < 10) {
        appreciation +=
          "Revois sérieusement les bases des activités pour éviter que cette faiblesse affecte tes résultats.";
      } else if (moyennesEvaluations >= 14 && moyenneTP >= 16) {
        appreciation +=
          "Concentre-toi sur les concepts théoriques pour aligner ta moyenne générale avec tes performances en activité.";
      } else if (moyennesEvaluations >= 14 && moyenneTP >= 14) {
        appreciation +=
          "Continue à travailler régulièrement pour maintenir et améliorer tes résultats.";
      } else if (moyennesEvaluations >= 14 && moyenneTP >= 12) {
        appreciation +=
          "Consacre un peu plus de temps aux activités pour améliorer ton bilan global.";
      } else if (moyennesEvaluations >= 14 && moyenneTP >= 10) {
        appreciation +=
          "Un effort supplémentaire en activité te permettra de mieux équilibrer tes résultats.";
      } else if (moyennesEvaluations >= 14 && moyenneTP < 10) {
        appreciation +=
          "Il est important de renforcer tes compétences dans les activités pour éviter de creuser l'écart avec ta moyenne générale.";
      } else if (moyennesEvaluations >= 12 && moyenneTP >= 16) {
        appreciation +=
          "Intéresse-toi davantage à la théorie pour équilibrer tes performances avec tes résultats en activité.";
      } else if (moyennesEvaluations >= 12 && moyenneTP >= 14) {
        appreciation +=
          "Intensifie tes révisions théoriques pour améliorer ta moyenne générale et équilibrer tes résultats.";
      } else if (moyennesEvaluations >= 12 && moyenneTP >= 12) {
        appreciation +=
          "Un travail plus régulier te permettra de progresser de manière équilibrée.";
      } else if (moyennesEvaluations >= 12 && moyenneTP >= 10) {
        appreciation +=
          "Un renforcement des compétences en activité est nécessaire pour soutenir ta moyenne générale.";
      } else if (moyennesEvaluations >= 12 && moyenneTP < 10) {
        appreciation +=
          "Consacre plus de temps à l'étude et à la pratique pour améliorer tes résultats.";
      } else if (moyennesEvaluations >= 10 && moyenneTP >= 16) {
        appreciation +=
          "Revois tes bases théoriques pour aligner ta performance globale avec tes résultats en activité.";
      } else if (moyennesEvaluations >= 10 && moyenneTP >= 14) {
        appreciation +=
          "Redouble d’efforts en théorie pour améliorer ta moyenne générale et équilibrer tes résultats.";
      } else if (moyennesEvaluations >= 10 && moyenneTP >= 12) {
        appreciation +=
          "Revois les bases pour améliorer tes résultats globaux.";
      } else if (moyennesEvaluations >= 10 && moyenneTP >= 10) {
        appreciation +=
          "Un travail plus régulier en théorie et en activité te permettra de surmonter tes difficultés.";
      } else if (moyennesEvaluations >= 10 && moyenneTP < 10) {
        appreciation +=
          "Travaille plus sérieusement pour remonter tes résultats.";
      } else if (moyennesEvaluations < 10 && moyenneTP >= 16) {
        appreciation +=
          "Il est essentiel de revoir tes bases théoriques pour équilibrer ta performance globale.";
      } else if (moyennesEvaluations < 10 && moyenneTP >= 14) {
        appreciation +=
          "Concentre-toi sur la théorie pour améliorer ta moyenne générale et t’aligner sur tes bons résultats en activité.";
      } else if (moyennesEvaluations < 10 && moyenneTP >= 12) {
        appreciation += "Renforce ton travail pour améliorer tes résultats.";
      } else if (moyennesEvaluations < 10 && moyenneTP >= 10) {
        appreciation +=
          "Revois sérieusement tes bases théoriques et pratiques pour rattraper tes lacunes.";
      } else if (moyennesEvaluations < 10 && moyenneTP < 10) {
        appreciation +=
          "Consacre plus de temps à l'étude et à la pratique pour surmonter ces difficultés et améliorer tes résultats.";
      }
    }

    // Ajouter une note sur le taux de présence si nécessaire
    if (attendancePercentage < 55) {
      appreciation +=
        "Cependant, l'appréciation doit être nuancée en tenant compte du taux de présence aux évaluations.";
    }

    return appreciation;
  };

  const generateConfiguredData = () => {
    const configured = data.slice(startLine).map((row) => {
      const configuredRow = {
        Nom: "",
        "Moy. T1": "",
        "Moy. T2": "",
        "Moy. T3": "",
        "Moy Evaluation": [],
        "Moy TP": [],
        Evaluations: [],
        TPs: [],
      };

      headers.forEach((header, index) => {
        const config = columnConfig[header];
        const value = row[index];

        switch (config) {
          case "NOM":
            configuredRow.Nom = value;
            break;
          case "Moy. T1":
            configuredRow["Moy. T1"] = value;
            break;
          case "Moy. T2":
            configuredRow["Moy. T2"] = value;
            break;
          case "Moy. T3":
            configuredRow["Moy. T3"] = value;
            break;
          case "Evaluation":
            configuredRow["Moy Evaluation"].push(value);
            configuredRow["Evaluations"].push(value);
            break;
          case "TP":
            configuredRow["Moy TP"].push(value);
            configuredRow["TPs"].push(value);
            break;
          default:
            break;
        }
      });

      configuredRow["Moy Evaluation"] = calculateAverage(
        configuredRow["Moy Evaluation"].filter(
          (v) => !["Abs", "N.Not", "X"].includes(v)
        )
      ).toFixed(2);
      configuredRow["Moy TP"] = calculateAverage(
        configuredRow["Moy TP"].filter(
          (v) => !["Abs", "N.Not", "X"].includes(v)
        )
      ).toFixed(2);
      configuredRow["% Présence"] = calculatePresenceRate(
        configuredRow["Evaluations"],
        configuredRow["TPs"]
      );

      // Calculer la moyenne générale
      const moyenne = calculateAverage([
        parseFloat(configuredRow["Moy. T1"]),
        parseFloat(configuredRow["Moy. T2"]),
        parseFloat(configuredRow["Moy. T3"]),
        parseFloat(configuredRow["Moy Evaluation"]),
        parseFloat(configuredRow["Moy TP"]),
      ]);
      // Créer un tableau des moyennes trimestrielles
      const moyennesTrimestrielles = [
        parseFloat(configuredRow["Moy. T1"]),
        parseFloat(configuredRow["Moy. T2"]),
        parseFloat(configuredRow["Moy. T3"]),
      ].filter((m) => !isNaN(m));

      // Générer l'appréciation
      configuredRow["Appréciation"] = generateAppreciation(
        moyenne,
        parseFloat(configuredRow["Moy TP"]),
        parseFloat(configuredRow["Moy Evaluation"]),
        configuredRow["% Présence"],
        moyennesTrimestrielles
      );
      return configuredRow;
    });

    setConfiguredData(configured);

    // Scroll to the configured table after a short delay
    setTimeout(() => {
      if (configuredTableRef.current) {
        configuredTableRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };
  // Fonction pour copier l'appréciation dans le presse-papier
  const copyAppreciation = (appreciation) => {
    navigator.clipboard.writeText(appreciation).then(
      () => {
        alert("Appréciation copiée dans le presse-papier !");
      },
      (err) => {
        console.error("Erreur lors de la copie: ", err);
      }
    );
  };
  // Gère le showTutorial
  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };

  const getColumnOptions = () => {
    const usedUniqueOptions = Object.values(columnConfig).filter((value) =>
      ["NOM", "Moy. T1", "Moy. T2", "Moy. T3"].includes(value)
    );

    return (
      <>
        <option value="ignore">Ignorer</option>
        <option value="Evaluation">Évaluation</option>
        <option value="TP">TP</option>
        <optgroup label="Options uniques">
          {["NOM", "Moy. T1", "Moy. T2", "Moy. T3"].map((option) => (
            <option
              key={option}
              value={option}
              disabled={usedUniqueOptions.includes(option)}
            >
              {option}
            </option>
          ))}
        </optgroup>
      </>
    );
  };

  return (
    <div className="container">
      <h1 className="main-title">SOPHIE</h1>
      <h2 className="sub-title">
        Système Optimisé Pour Harmoniser les Interactions Éducatives
      </h2>
      <p>
        Cette application a pour objectif de vous aider à la rédaction de vos
        appréciations. L'appréciation idéale se situe entre ces deux pratiques :
        Objectivité et Personnalisation
        <br />
        <br />
        Voici un article qui résume bien cette philosophie{" "}
        <a
          href="https://etreprof.fr/ressources/4327/rediger-des-appreciations-efficaces-et-constructives-en-secondaire-mode-d-emploi"
          target="_blank"
          rel="noopener noreferrer"
        >
          Lien vers article
        </a>
        .
        <br />
      </p>
      <p>
        Si vous avez des questions ou des retours, n'hésitez pas à me contacter
        à :{" "}
        <a href="mailto:te-dunne.thomas@ac-poitiers.fr">
          te-dunne.thomas@ac-poitiers.fr
        </a>
        .
      </p>
      {/* Flèche pour afficher/masquer le tutoriel */}
      <div
        onClick={toggleTutorial}
        style={{ cursor: "pointer", marginTop: "20px", fontSize: "1.5rem" }}
      >
        {showTutorial ? "▼ Masquer le tutoriel" : "▶ Voir le tutoriel"}
      </div>

      {/* Contenu du tutoriel qui s'affiche/masque selon l'état */}
      {showTutorial && (
        <div style={{ marginTop: "20px" }}>
          <h3>Bienvenue!</h3>
          <p>
            Dans ce tutoriel, nous allons apprendre à importer des notes depuis{" "}
            <strong>Pronote</strong> et à les intégrer dans un fichier CSV pour
            générer des appréciations. <br />
            <br />
            <strong>
              Pour les collègues qui travaillent par compétences, je vous invite
              à consulter la section dédiée à ce cas particulier en bas du
              tutoriel.
            </strong>
          </p>

          <h3>Étape 1 : Téléchargement des notes depuis Pronote</h3>
          <ol>
            <li>
              <strong>Connexion à Pronote</strong>
              <br />
              Connectez-vous sur Pronote et accédez à l'onglet{" "}
              <strong>Notes</strong>.<br />
              Vous pouvez aussi suivre cette{" "}
              <a
                href="https://drive.google.com/file/d/1yY6w9aPD7LlTb63YjobElvZdTNAw4o31/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                démonstration visuelle sous forme de GIF
              </a>
              .
            </li>
            <li>
              <strong>Exportation des données</strong>
              <br />
              Sélectionnez la classe concernée et cliquez sur{" "}
              <strong>Récupérer les notes depuis le presse-papier</strong>.
            </li>
            <li>
              <strong>Préparation du fichier CSV</strong>
              <br />
              Vous pouvez télécharger un modèle ici :{" "}
              <a
                href="https://drive.google.com/uc?export=download&id=1N9AOOEMZ3mfRL2-_-U7EKrCBwmFTmXgx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger le modèle de fichier .csv
              </a>
              . Ouvrez ensuite le fichier CSV et collez vos données dans la
              cellule A1.
            </li>
          </ol>

          <h3>Étape 2 : Importation du fichier CSV</h3>
          <ol>
            <li>
              <strong>Importer le fichier</strong>
              <br />
              Cliquez sur <strong>Choisir un fichier</strong> pour importer
              votre CSV.
              <br />
              Une fois l'importation terminée, les données du fichier CSV seront
              affichées.
            </li>
            <li>
              <strong>Supprimer les lignes inutiles</strong>
              <br />
              Vous pouvez supprimer les lignes qui ne vous intéressent pas en
              ajustant le numéro de ligne à partir duquel les données doivent
              commencer.
            </li>
          </ol>

          <h3>Étape 3 : Configuration des colonnes</h3>
          <ol>
            <li>
              <strong>Définir la colonne des noms</strong>
              <br />
              Configurez la première colonne comme <strong>Nom</strong>{" "}
              (normalement déjà sélectionnée).
            </li>
            <li>
              <strong>Gérer les moyennes</strong>
              <br />
              Si vous travaillez par trimestre, sélectionnez les colonnes
              correspondant à <strong>T1</strong>, <strong>T2</strong>, ou{" "}
              <strong>T3</strong>.<br />
              Si vous travaillez en semestres, utilisez simplement{" "}
              <strong>T1</strong> et <strong>T2</strong>.
            </li>
            <li>
              <strong>Évaluations</strong>
              <br />
              Choisissez entre deux types d’évaluations :
              <ul>
                <li>
                  <strong>Évaluation écrite</strong> : Nommez l'évaluation selon
                  son type.
                </li>
                <li>
                  <strong>Évaluation de TP/Activité de groupe</strong> : Dans ce
                  cas, indiquez "TP" directement.
                </li>
              </ul>
              Répétez cette étape pour chaque colonne que vous souhaitez
              configurer.
            </li>
          </ol>

          <h3>Étape 4 : Générer le tableau</h3>
          <p>
            Une fois toutes les colonnes configurées, cliquez sur{" "}
            <strong>Générer le tableau</strong>.<br />
            Si une erreur s'est glissée dans la configuration, il vous suffit de
            revenir en arrière et de cliquer de nouveau sur{" "}
            <strong>Générer le tableau</strong> après correction.
          </p>

          <h3>Étape 5 : Gestion des appréciations</h3>
          <p>Les appréciations fonctionnent de la manière suivante :</p>
          <ul>
            <li>
              Si un élève a moins de <strong>50% de présence</strong>, une
              phrase spécifique sera automatiquement ajoutée à l'appréciation.
            </li>
            <li>
              L'appréciation tiendra compte des moyennes que vous avez définies
              pour les évaluations et les TP. Il fera la moyenne des deux pour
              générer une appréciation formelle sur la période.
            </li>
          </ul>
          <p>
            Si plusieurs trimestres ou semestres sont sélectionnés, le système
            générera un <strong>constat global</strong> basé sur :
          </p>
          <ul>
            <li>La moyenne générale sur la période,</li>
            <li>Le travail réalisé en TP et en groupe,</li>
            <li>
              Un conseil basé sur le décalage entre les évaluations et les TP
              pour aider l'élève à améliorer ses performances.
            </li>
          </ul>
          <p>
            Si un élève est complètement absent, l'appréciation sera simplement
            : <strong>Élève absent</strong>.
          </p>
          <p>
            Pour copier une appréciation, cliquez sur l'appréciation souhaitée.
            Elle sera automatiquement copiée dans votre presse-papier.
          </p>

          <h3>Cas particulier : Évaluation par compétences</h3>
          <p>
            Si vous travaillez uniquement par compétences, vous devrez convertir
            toutes vos évaluations en notes via Pronote. Pour cela, accédez à
            chaque évaluation, cliquez sur son intitulé et cochez la case
            <strong> Créer un devoir</strong>. Ensuite, cliquez sur le symbole
            de somme pour convertir vos compétences. Vous pourrez récupérer vos
            notes dans l'onglet <strong>Notes</strong>. Après cela, vous pourrez
            continuer le tutoriel.
          </p>

          <p>
            <em>Note :</em> Une future version du logiciel permettra de
            récupérer directement vos compétences.
          </p>
        </div>
      )}

      <div className="container">
        <h2>Importation et Configuration CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileSelect} />

        {headers.length > 0 && (
          <div>
            <h2>Données du CSV et Configuration</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <label style={{ marginRight: "10px" }}>
                Commencer à partir de la ligne :
                <input
                  type="number"
                  value={startLine}
                  onChange={(e) =>
                    setStartLine(Math.max(1, parseInt(e.target.value)))
                  }
                  min="1"
                  style={{ marginLeft: "5px" }}
                />
              </label>
              <button onClick={generateConfiguredData}>
                Générer le tableau configuré
              </button>
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    Ligne
                  </th>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      style={{ border: "1px solid black", padding: "5px" }}
                    >
                      {header}
                      <select
                        onChange={(e) =>
                          handleColumnConfigChange(header, e.target.value)
                        }
                        value={columnConfig[header]}
                        style={{ marginLeft: "5px" }}
                      >
                        {getColumnOptions()}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(startLine).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      {startLine + rowIndex}
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{ border: "1px solid black", padding: "5px" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {configuredData.length > 0 && (
          <div ref={configuredTableRef}>
            <h2>Tableau Configuré</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    Nom
                  </th>
                  {Object.values(columnConfig).includes("Moy. T1") && (
                    <th style={{ border: "1px solid black", padding: "5px" }}>
                      Moy. T1
                    </th>
                  )}
                  {Object.values(columnConfig).includes("Moy. T2") && (
                    <th style={{ border: "1px solid black", padding: "5px" }}>
                      Moy. T2
                    </th>
                  )}
                  {Object.values(columnConfig).includes("Moy. T3") && (
                    <th style={{ border: "1px solid black", padding: "5px" }}>
                      Moy. T3
                    </th>
                  )}
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    Moy Evaluation
                  </th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    Moy TP
                  </th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    % Présence
                  </th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>
                    Appréciation
                  </th>
                </tr>
              </thead>
              <tbody>
                {configuredData.map((row, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      {row.Nom}
                    </td>
                    {Object.values(columnConfig).includes("Moy. T1") && (
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {row["Moy. T1"]}
                      </td>
                    )}
                    {Object.values(columnConfig).includes("Moy. T2") && (
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {row["Moy. T2"]}
                      </td>
                    )}
                    {Object.values(columnConfig).includes("Moy. T3") && (
                      <td style={{ border: "1px solid black", padding: "5px" }}>
                        {row["Moy. T3"]}
                      </td>
                    )}
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      {row["Moy Evaluation"]}
                    </td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      {row["Moy TP"]}
                    </td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>
                      {row["% Présence"]}%
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => copyAppreciation(row["Appréciation"])}
                      title="Cliquez pour copier l'appréciation"
                    >
                      {row["Appréciation"]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
