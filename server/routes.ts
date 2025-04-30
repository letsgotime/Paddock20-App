import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { storage } from './storage';
import * as schema from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Vehicles API routes
  app.get('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const vehicles = await storage.getAllVehicles(req.user?.id);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  app.get('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
  });

  app.post('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertVehicleSchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      const newVehicle = await storage.createVehicle(validatedData);
      res.status(201).json(newVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  });

  app.patch('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedVehicle = await storage.updateVehicle(vehicleId, req.body);
      res.json(updatedVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  app.delete('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteVehicle(vehicleId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  // Modifications API routes
  app.get('/api/vehicles/:id/modifications', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const modifications = await storage.getModificationsByVehicleId(vehicleId);
      res.json(modifications);
    } catch (error) {
      console.error('Error fetching modifications:', error);
      res.status(500).json({ error: 'Failed to fetch modifications' });
    }
  });

  app.post('/api/modifications', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertModificationSchema.parse(req.body);
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newModification = await storage.createModification(validatedData);
      
      // Add points for verified modification
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: 100, // Base points for adding a modification
        type: 'earned',
        source: 'modification',
        sourceId: newModification.id,
        description: `Points earned for adding modification: ${newModification.name}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newModification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating modification:', error);
      res.status(500).json({ error: 'Failed to create modification' });
    }
  });

  app.patch('/api/modifications/:id', async (req: Request, res: Response) => {
    try {
      const modificationId = parseInt(req.params.id);
      const modification = await storage.getModification(modificationId);
      if (!modification) {
        return res.status(404).json({ error: 'Modification not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(modification.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedModification = await storage.updateModification(modificationId, req.body);
      res.json(updatedModification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating modification:', error);
      res.status(500).json({ error: 'Failed to update modification' });
    }
  });

  app.delete('/api/modifications/:id', async (req: Request, res: Response) => {
    try {
      const modificationId = parseInt(req.params.id);
      const modification = await storage.getModification(modificationId);
      if (!modification) {
        return res.status(404).json({ error: 'Modification not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(modification.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteModification(modificationId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting modification:', error);
      res.status(500).json({ error: 'Failed to delete modification' });
    }
  });

  // Maintenance Records API routes
  app.get('/api/vehicles/:id/maintenance-records', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const maintenanceRecords = await storage.getMaintenanceRecordsByVehicleId(vehicleId);
      res.json(maintenanceRecords);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
  });

  app.post('/api/maintenance-records', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertMaintenanceRecordSchema.parse(req.body);
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newRecord = await storage.createMaintenanceRecord(validatedData);
      
      // Add points for verified maintenance record
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: 50, // Base points for adding a maintenance record
        type: 'earned',
        source: 'maintenance',
        sourceId: newRecord.id,
        description: `Points earned for adding maintenance record: ${newRecord.title}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating maintenance record:', error);
      res.status(500).json({ error: 'Failed to create maintenance record' });
    }
  });

  app.patch('/api/maintenance-records/:id', async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      if (!record) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(record.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedRecord = await storage.updateMaintenanceRecord(recordId, req.body);
      res.json(updatedRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating maintenance record:', error);
      res.status(500).json({ error: 'Failed to update maintenance record' });
    }
  });

  app.delete('/api/maintenance-records/:id', async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      if (!record) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(record.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteMaintenanceRecord(recordId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      res.status(500).json({ error: 'Failed to delete maintenance record' });
    }
  });

  // Tire Setups API routes
  app.get('/api/vehicles/:id/tire-setups', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const tireSetups = await storage.getTireSetupsByVehicleId(vehicleId);
      res.json(tireSetups);
    } catch (error) {
      console.error('Error fetching tire setups:', error);
      res.status(500).json({ error: 'Failed to fetch tire setups' });
    }
  });

  app.post('/api/tire-setups', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertTireSetupSchema.parse(req.body);
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newSetup = await storage.createTireSetup(validatedData);
      
      // Add points for verified tire setup
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: 75, // Base points for adding a tire setup
        type: 'earned',
        source: 'tire_setup',
        sourceId: newSetup.id,
        description: `Points earned for adding tire setup: ${newSetup.brand} ${newSetup.model}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newSetup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating tire setup:', error);
      res.status(500).json({ error: 'Failed to create tire setup' });
    }
  });

  app.patch('/api/tire-setups/:id', async (req: Request, res: Response) => {
    try {
      const setupId = parseInt(req.params.id);
      const setup = await storage.getTireSetup(setupId);
      if (!setup) {
        return res.status(404).json({ error: 'Tire setup not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(setup.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedSetup = await storage.updateTireSetup(setupId, req.body);
      res.json(updatedSetup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating tire setup:', error);
      res.status(500).json({ error: 'Failed to update tire setup' });
    }
  });

  app.delete('/api/tire-setups/:id', async (req: Request, res: Response) => {
    try {
      const setupId = parseInt(req.params.id);
      const setup = await storage.getTireSetup(setupId);
      if (!setup) {
        return res.status(404).json({ error: 'Tire setup not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(setup.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteTireSetup(setupId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tire setup:', error);
      res.status(500).json({ error: 'Failed to delete tire setup' });
    }
  });

  // Detailing Sessions API routes
  app.get('/api/vehicles/:id/detailing-sessions', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const detailingSessions = await storage.getDetailingSessionsByVehicleId(vehicleId);
      res.json(detailingSessions);
    } catch (error) {
      console.error('Error fetching detailing sessions:', error);
      res.status(500).json({ error: 'Failed to fetch detailing sessions' });
    }
  });

  app.post('/api/detailing-sessions', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertDetailingSessionSchema.parse(req.body);
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newSession = await storage.createDetailingSession(validatedData);
      
      // Calculate points based on detailing type
      let points = 25; // Basic wash
      
      switch (validatedData.type) {
        case 'full_detail':
          points = 150;
          break;
        case 'ceramic':
          points = 200;
          break;
        case 'polish':
          points = 125;
          break;
        case 'wax':
          points = 75;
          break;
        case 'interior':
          points = 100;
          break;
        default:
          points = 25;
      }
      
      // Add more points for documentation
      if (validatedData.beforePhotos && validatedData.beforePhotos.length > 0) points += 15;
      if (validatedData.afterPhotos && validatedData.afterPhotos.length > 0) points += 15;
      if (validatedData.outdoorTemp || validatedData.indoorTemp || validatedData.surfaceTemp) points += 10;
      if (validatedData.paintThicknessReadings && Object.keys(validatedData.paintThicknessReadings).length > 0) points += 25;
      
      // Add points for verified detailing session
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: points,
        type: 'earned',
        source: 'detailing',
        sourceId: newSession.id,
        description: `Points earned for adding detailing session: ${newSession.title}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating detailing session:', error);
      res.status(500).json({ error: 'Failed to create detailing session' });
    }
  });

  app.patch('/api/detailing-sessions/:id', async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getDetailingSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Detailing session not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(session.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedSession = await storage.updateDetailingSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating detailing session:', error);
      res.status(500).json({ error: 'Failed to update detailing session' });
    }
  });

  app.delete('/api/detailing-sessions/:id', async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getDetailingSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Detailing session not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(session.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteDetailingSession(sessionId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting detailing session:', error);
      res.status(500).json({ error: 'Failed to delete detailing session' });
    }
  });

  // Vehicle Documents API routes
  app.get('/api/vehicles/:id/documents', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const documents = await storage.getDocumentsByVehicleId(vehicleId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/vehicle-documents', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertVehicleDocumentSchema.parse(req.body);
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newDocument = await storage.createVehicleDocument(validatedData);
      
      // Add points for verified document
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: 25, // Base points for adding a document
        type: 'earned',
        source: 'document',
        sourceId: newDocument.id,
        description: `Points earned for adding vehicle document: ${newDocument.title}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });

  app.patch('/api/vehicle-documents/:id', async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getVehicleDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(document.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updatedDocument = await storage.updateVehicleDocument(documentId, req.body);
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  app.delete('/api/vehicle-documents/:id', async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getVehicleDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(document.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      await storage.deleteVehicleDocument(documentId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // Drive Journal Entries API routes
  app.get('/api/vehicles/:id/drive-journals', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const entries = await storage.getDriveJournalEntriesByVehicleId(vehicleId);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching drive journal entries:', error);
      res.status(500).json({ error: 'Failed to fetch drive journal entries' });
    }
  });

  app.post('/api/drive-journals', async (req: Request, res: Response) => {
    try {
      const validatedData = schema.insertDriveJournalEntrySchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      // Check if the vehicle belongs to the user
      const vehicle = await storage.getVehicle(validatedData.vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const newEntry = await storage.createDriveJournalEntry(validatedData);
      
      // Calculate points based on drive journal details
      let points = 20; // Base points for a drive entry
      
      // Add points for distance
      if (validatedData.distanceMiles) {
        if (validatedData.distanceMiles > 100) points += 30;
        else if (validatedData.distanceMiles > 50) points += 20;
        else if (validatedData.distanceMiles > 10) points += 10;
      }
      
      // Add points for documentation
      if (validatedData.photos && validatedData.photos.length > 0) points += 15;
      if (validatedData.videos && validatedData.videos.length > 0) points += 20;
      if (validatedData.audioNotes && validatedData.audioNotes.length > 0) points += 15;
      if (validatedData.gpxFile) points += 25;
      
      // Add points for comprehensive data
      if (validatedData.startOdometer && validatedData.endOdometer) points += 10;
      if (validatedData.avgSpeed && validatedData.maxSpeed) points += 10;
      if (validatedData.fuelUsed && validatedData.avgMpg) points += 10;
      if (validatedData.description && validatedData.description.length > 100) points += 10;
      
      // Add points for vehicle performance feedback
      if (validatedData.handlingFeedback || validatedData.brakesFeedback || 
          validatedData.accelerationFeedback || validatedData.comfortFeedback) {
        points += 15;
      }
      
      // Add points for verified drive journal entry
      await storage.addPointsTransaction({
        userId: req.user?.id,
        amount: points,
        type: 'earned',
        source: 'drive_journal',
        sourceId: newEntry.id,
        description: `Points earned for adding drive journal entry: ${newEntry.title || 'Drive on ' + newEntry.date}`,
        vehicle_id: validatedData.vehicleId
      });
      
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating drive journal entry:', error);
      res.status(500).json({ error: 'Failed to create drive journal entry' });
    }
  });

  app.patch('/api/drive-journals/:id', async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getDriveJournalEntry(entryId);
      if (!entry) {
        return res.status(404).json({ error: 'Drive journal entry not found' });
      }

      // Check if the entry belongs to the user
      if (entry.userId !== req.user?.id) {
        return res.status(403).json({ error: 'Not authorized to access this drive journal entry' });
      }

      const updatedEntry = await storage.updateDriveJournalEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating drive journal entry:', error);
      res.status(500).json({ error: 'Failed to update drive journal entry' });
    }
  });

  app.delete('/api/drive-journals/:id', async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getDriveJournalEntry(entryId);
      if (!entry) {
        return res.status(404).json({ error: 'Drive journal entry not found' });
      }

      // Check if the entry belongs to the user
      if (entry.userId !== req.user?.id) {
        return res.status(403).json({ error: 'Not authorized to access this drive journal entry' });
      }

      await storage.deleteDriveJournalEntry(entryId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting drive journal entry:', error);
      res.status(500).json({ error: 'Failed to delete drive journal entry' });
    }
  });

  // Points Transactions API routes
  app.get('/api/points', async (req: Request, res: Response) => {
    try {
      const points = await storage.getPointsTransactionsByUserId(req.user?.id);
      res.json(points);
    } catch (error) {
      console.error('Error fetching points transactions:', error);
      res.status(500).json({ error: 'Failed to fetch points transactions' });
    }
  });

  app.get('/api/points/balance', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.user?.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ balance: user.pointsBalance });
    } catch (error) {
      console.error('Error fetching points balance:', error);
      res.status(500).json({ error: 'Failed to fetch points balance' });
    }
  });

  app.get('/api/vehicles/:id/points', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(vehicleId, req.user?.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const pointsTransactions = await storage.getPointsTransactionsByVehicleId(vehicleId);
      const totalPoints = pointsTransactions.reduce((sum, transaction) => {
        if (transaction.type === 'earned') {
          return sum + transaction.amount;
        }
        return sum;
      }, 0);

      res.json({ transactions: pointsTransactions, totalPoints });
    } catch (error) {
      console.error('Error fetching vehicle points:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle points' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}