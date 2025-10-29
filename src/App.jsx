import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const API_KEY = "8mX7gZlFBm0bJ7jjhjg8atBpr5eGql72xYvIMpT4";
  const [spots, setSpots] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [spotData, setSpotData] = useState(null);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [loadingSpotData, setLoadingSpotData] = useState(false);

  useEffect(() => {
    const getSpots = async () => {
      setLoadingSpots(true);
      try {
        const response = await axios.get("https://api.iotebe.com/v2/spot", {
          headers: { "x-api-key": API_KEY },
        });
        setSpots(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSpots(false);
      }
    };
    getSpots();
  }, []);

  useEffect(() => {
    const getSpotData = async () => {
      if (!selectedSpotId) return;
      setLoadingSpotData(true);
      try {
        const response = await axios.get(
          `https://api.iotebe.com/v2/spot/${selectedSpotId}/ng1vt/global_data/data`,
          { headers: { "x-api-key": API_KEY } }
        );
        setSpotData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSpotData(false);
      }
    };
    getSpotData();
  }, [selectedSpotId]);

  const renderChart = (dataKey, color, title, unit = "") => (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={spotData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
          />
          <YAxis unit={unit} />
          <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="app-container">
      <h1>Ponto de Coleta</h1>

      {loadingSpots && <div className="loading">Carregando pontos...</div>}

      {spots && (
        <select
          className="spot-select"
          onChange={(e) => setSelectedSpotId(e.target.value)}
        >
          <option value="">Selecione um ponto de coleta</option>
          {spots.map((spot) => (
            <option key={spot.spot_id} value={spot.spot_id}>
              {spot.spot_name}
            </option>
          ))}
        </select>
      )}

      {loadingSpotData && <div className="loading">Carregando dados...</div>}

      {spotData && spotData.length > 0 && (
        <div className="charts-container">
          {renderChart("temperature", "#8884d8", "Temperatura", "°C")}
          {renderChart("acceleration_axial", "#82ca9d", "Aceleração Axial")}
          {renderChart("acceleration_horizontal", "#ff7300", "Aceleração Horizontal")}
          {renderChart("acceleration_vertical", "#387908", "Aceleração Vertical")}
          {renderChart("velocity_axial", "#e60049", "Velocidade Axial")}
          {renderChart("velocity_horizontal", "#0a9396", "Velocidade Horizontal")}
          {renderChart("velocity_vertical", "#ffb703", "Velocidade Vertical")}
        </div>
      )}
    </div>
  );
}

export default App;
