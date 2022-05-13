const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server started and running at port 5000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// get all players API
app.get("/players/", async (req, res) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersArray = await db.all(getAllPlayersQuery);
  res.send(playersArray);
});

// insert a new player API
app.post("/players/", async (req, res) => {
  try {
    const playerDetails = req.body;
    const { playerName, jerseyNumber, role } = playerDetails;

    const newPlayerInsertQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}')`;
    await db.run(newPlayerInsertQuery);
    res.send("Player Added to Team");
  } catch (e) {
    console.log(`error while inserting data: ${e.message}`);
  }
});

// get player API
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  res.send(playerDetails);
});

// update player details API
app.put("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    const playerDetails = req.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId}`;
    await db.run(updatePlayerQuery);
    res.send("Player Details Updated");
  } catch (e) {
    console.log(`Error while updating the data: ${e.message}`);
  }
});

// delete player API
app.delete("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
