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
  const [spots, setSpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [spotData, setSpotData] = useState([]);
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

  // Renderizar gráfico + valor atual
  const renderChart = (dataKey, color, title, unit = "") => {
    if (!spotData || spotData.length === 0) return null;
    const lastValue = spotData[spotData.length - 1][dataKey];

    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3>{title}</h3>
          <p className="chart-value">
            <strong>{lastValue?.toFixed(2)}</strong> {unit}
          </p>
        </div>
       <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spotData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
            />
            <YAxis unit={unit} />
            <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
            <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Coluna esquerda - pontos */}
      <div className="sidebar">
        <h2>Pontos de Coleta</h2>

        {loadingSpots && <p>Carregando...</p>}

        <ul className="spot-list">
          {spots.map((spot) => (
            <li
              key={spot.spot_id}
              onClick={() => setSelectedSpotId(spot.spot_id)}
              className={spot.spot_id === selectedSpotId ? "active" : ""}
            >
              {spot.spot_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna direita - gráficos */}
      <div className="content">
        <h1>Monitoramento</h1>

        {loadingSpotData && <div className="loading">Carregando dados...</div>}

        {!selectedSpotId && <p>Selecione um ponto à esquerda para visualizar os dados.</p>}

        {spotData && spotData.length > 0 && (
          <div className="charts-column">
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
    </div>
  );
}

export default App;
