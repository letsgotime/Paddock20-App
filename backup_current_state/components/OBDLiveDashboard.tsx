import React, { useState } from "react";

const obdCommands = [
  { label: "Engine RPM (010C)", value: "010C" },
  { label: "Vehicle Speed (010D)", value: "010D" },
  { label: "Engine Coolant Temp (0105)", value: "0105" },
  { label: "Fuel Level (012F)", value: "012F" },
  { label: "Throttle Position (0111)", value: "0111" },
];

const OBDLiveDashboard = () => {
  const [device, setDevice] = useState<any>(null);
  const [characteristic, setCharacteristic] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<string>("");

  const connectToOBD = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "OBD" }],
        optionalServices: [0xFFE0],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(0xFFE0);
      const characteristic = await service.getCharacteristic(0xFFE1);

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        const data = decoder.decode(value);
        setTelemetry(data.trim());
      });

      setDevice(device);
      setCharacteristic(characteristic);
      alert("✅ Connected to OBD-II adapter!");
    } catch (err) {
      console.error("OBD Connection failed:", err);
      alert("❌ Failed to connect to OBD device.");
    }
  };

  const sendCommand = async (command: string) => {
    if (!characteristic) {
      alert("❌ Not connected to a vehicle.");
      return;
    }

    const encoder = new TextEncoder();
    const cmd = encoder.encode(`${command}\r`);
    await characteristic.writeValue(cmd);
  };

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 rounded-lg shadow-lg border border-blue-500/30 max-w-4xl mx-auto">
      <h2 className="text-blue-400 font-orbitron text-xl text-center mb-4">🚗 Live Vehicle Telemetry</h2>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={connectToOBD}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md flex items-center gap-2"
        >
          <span className="text-lg">🔗</span> Connect to OBD-II
        </button>

        <select
          onChange={(e) => sendCommand(e.target.value)}
          defaultValue=""
          className="bg-gray-800 text-white p-2 rounded-lg w-full max-w-sm border border-gray-700"
        >
          <option value="" disabled>Select a Command</option>
          {obdCommands.map((cmd) => (
            <option key={cmd.value} value={cmd.value}>
              {cmd.label}
            </option>
          ))}
        </select>

        <div className="mt-4 w-full max-w-md p-4 bg-black rounded-lg border border-gray-700 text-center">
          <h3 className="text-blue-400 font-orbitron mb-2">📈 Latest Response</h3>
          <p className="text-white text-xl">{telemetry || "-- Waiting for Data --"}</p>
        </div>
      </div>
    </div>
  );
};

export default OBDLiveDashboard;