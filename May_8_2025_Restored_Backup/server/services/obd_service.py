#!/usr/bin/env python3
"""
PADDOCK20 OBD-II Service
F1-grade vehicle telemetry service for the modern driver
"""

import obd
import json
import sys
import time
import logging
from threading import Thread
from flask import Flask, jsonify, request

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("OBD-Service")

# Create Flask app
app = Flask(__name__)

# Global connection object
connection = None
connection_status = {
    "connected": False,
    "port": None,
    "protocol": None,
    "status": "Not Connected"
}

# List of commands to monitor by default (can be configured)
default_commands = [
    obd.commands.SPEED,
    obd.commands.RPM,
    obd.commands.COOLANT_TEMP,
    obd.commands.INTAKE_TEMP,
    obd.commands.ENGINE_LOAD,
    obd.commands.THROTTLE_POS,
    obd.commands.FUEL_LEVEL,
    obd.commands.FUEL_PRESSURE,
    obd.commands.OIL_TEMP,
    obd.commands.BAROMETRIC_PRESSURE,
    obd.commands.AMBIANT_AIR_TEMP,
    obd.commands.DISTANCE_SINCE_DTC_CLEAR,
    obd.commands.FUEL_RATE,
    obd.commands.RUN_TIME
]

# Functions to manage OBD connection
def connect_obd(port=None, baudrate=None, protocol=None, fast=True):
    """Connect to the OBD-II adapter"""
    global connection, connection_status
    
    try:
        # Close any existing connection
        if connection:
            connection.close()
            connection = None
            
        # Update status
        connection_status["connected"] = False
        connection_status["status"] = "Connecting..."
        
        # Connection parameters
        connection_kwargs = {
            "fast": fast
        }
        
        if port:
            connection_kwargs["portstr"] = port
        if baudrate:
            connection_kwargs["baudrate"] = baudrate
        if protocol:
            connection_kwargs["protocol"] = protocol
            
        # Connect to adapter
        logger.info(f"Connecting to OBD with params: {connection_kwargs}")
        connection = obd.OBD(**connection_kwargs)
        
        # Check connection status
        if connection.status() == obd.OBDStatus.CAR_CONNECTED:
            connection_status["connected"] = True
            connection_status["port"] = connection.port_name()
            connection_status["protocol"] = connection.protocol_name()
            connection_status["status"] = "Connected"
            logger.info(f"Successfully connected to vehicle via {connection_status['port']} using {connection_status['protocol']}")
            return True
        else:
            connection_status["status"] = f"Failed: {connection.status()}"
            logger.warning(f"Connection failed: {connection.status()}")
            return False
    except Exception as e:
        connection_status["status"] = f"Error: {str(e)}"
        logger.error(f"Connection error: {str(e)}")
        return False

def get_available_ports():
    """Get list of available serial ports"""
    return obd.scan_serial()

def query_command(command):
    """Query a single OBD command and return the result"""
    global connection
    
    if not connection or not connection_status["connected"]:
        return {"error": "Not connected to vehicle"}
    
    try:
        # Query the command
        response = connection.query(command)
        
        # Check if command is supported and has a value
        if response.is_null():
            return {
                "command": command.name,
                "desc": command.desc,
                "supported": False,
                "value": None,
                "unit": None
            }
        
        # Get the value and unit
        value = response.value
        unit = None
        
        # Handle Pint quantities (values with units)
        if hasattr(value, "magnitude") and hasattr(value, "units"):
            unit = str(value.units)
            value = value.magnitude
            
        return {
            "command": command.name,
            "desc": command.desc,
            "supported": True,
            "value": value,
            "unit": unit
        }
    except Exception as e:
        logger.error(f"Error querying command {command.name}: {str(e)}")
        return {
            "command": command.name,
            "desc": command.desc,
            "error": str(e)
        }

def get_dtc_codes():
    """Get Diagnostic Trouble Codes from the vehicle"""
    global connection
    
    if not connection or not connection_status["connected"]:
        return {"error": "Not connected to vehicle"}
    
    try:
        # Query for stored DTCs
        response = connection.query(obd.commands.GET_DTC)
        
        if response.is_null():
            return {"supported": False, "codes": []}
        
        codes = []
        for code, desc in response.value:
            codes.append({
                "code": code,
                "description": desc
            })
            
        return {
            "supported": True,
            "count": len(codes),
            "codes": codes
        }
    except Exception as e:
        logger.error(f"Error getting DTC codes: {str(e)}")
        return {"error": str(e)}

def clear_dtc_codes():
    """Clear Diagnostic Trouble Codes from the vehicle"""
    global connection
    
    if not connection or not connection_status["connected"]:
        return {"error": "Not connected to vehicle"}
    
    try:
        # Send command to clear DTCs
        response = connection.query(obd.commands.CLEAR_DTC)
        
        return {
            "success": not response.is_null(),
            "message": "DTCs cleared successfully" if not response.is_null() else "Failed to clear DTCs"
        }
    except Exception as e:
        logger.error(f"Error clearing DTC codes: {str(e)}")
        return {"error": str(e)}

def get_supported_commands():
    """Get list of commands supported by the vehicle"""
    global connection
    
    if not connection or not connection_status["connected"]:
        return {"error": "Not connected to vehicle"}
    
    supported_commands = []
    
    try:
        # Check which commands are supported
        for command in obd.commands.modes:
            for cmd in obd.commands[command]:
                if connection.supports(cmd):
                    supported_commands.append({
                        "name": cmd.name,
                        "desc": cmd.desc,
                        "mode": cmd.mode,
                        "pid": cmd.pid
                    })
        
        return {
            "count": len(supported_commands),
            "commands": supported_commands
        }
    except Exception as e:
        logger.error(f"Error getting supported commands: {str(e)}")
        return {"error": str(e)}

# API Routes
@app.route('/api/obd/status', methods=['GET'])
def get_status():
    """Get current connection status"""
    return jsonify(connection_status)

@app.route('/api/obd/connect', methods=['POST'])
def api_connect():
    """Connect to OBD adapter"""
    data = request.json or {}
    port = data.get('port')
    baudrate = data.get('baudrate')
    protocol = data.get('protocol')
    fast = data.get('fast', True)
    
    result = connect_obd(port, baudrate, protocol, fast)
    
    return jsonify({
        "success": result,
        "status": connection_status
    })

@app.route('/api/obd/disconnect', methods=['POST'])
def api_disconnect():
    """Disconnect from OBD adapter"""
    global connection, connection_status
    
    if connection:
        connection.close()
        connection = None
    
    connection_status["connected"] = False
    connection_status["status"] = "Disconnected"
    
    return jsonify({
        "success": True,
        "status": connection_status
    })

@app.route('/api/obd/ports', methods=['GET'])
def api_get_ports():
    """Get available serial ports"""
    ports = get_available_ports()
    
    return jsonify({
        "count": len(ports),
        "ports": ports
    })

@app.route('/api/obd/data', methods=['GET'])
def api_get_data():
    """Get current data for all default commands"""
    if not connection or not connection_status["connected"]:
        return jsonify({"error": "Not connected to vehicle"})
    
    data = {}
    for command in default_commands:
        result = query_command(command)
        data[command.name] = result
    
    return jsonify(data)

@app.route('/api/obd/command/<command_name>', methods=['GET'])
def api_get_command(command_name):
    """Get data for a specific command"""
    if not connection or not connection_status["connected"]:
        return jsonify({"error": "Not connected to vehicle"})
    
    # Find command by name
    try:
        command = getattr(obd.commands, command_name)
        result = query_command(command)
        return jsonify(result)
    except AttributeError:
        return jsonify({"error": f"Command {command_name} not found"})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/api/obd/dtc', methods=['GET'])
def api_get_dtc():
    """Get Diagnostic Trouble Codes"""
    return jsonify(get_dtc_codes())

@app.route('/api/obd/dtc/clear', methods=['POST'])
def api_clear_dtc():
    """Clear Diagnostic Trouble Codes"""
    return jsonify(clear_dtc_codes())

@app.route('/api/obd/supported', methods=['GET'])
def api_get_supported():
    """Get supported commands"""
    return jsonify(get_supported_commands())

# Main entry point
if __name__ == '__main__':
    # Run Flask app on a specific port
    app.run(host='0.0.0.0', port=5001, debug=True)