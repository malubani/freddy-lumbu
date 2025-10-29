import { GoogleGenAI, Type } from "@google/genai";
import { TariffItem, BivacReport, VehicleReport, Suggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tariffResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      tariffCode: {
        type: Type.STRING,
        description: 'The tariff code, e.g., 01.01',
      },
      description: {
        type: Type.STRING,
        description: 'The description of the product.',
      },
      unit: {
        type: Type.STRING,
        description: 'The unit of quantity, e.g., u, kg.',
      },
      dutyNPF: {
        type: Type.STRING,
        description: 'The NPF customs duty rate, e.g., 5 %.',
      },
      dutyZLECAf: {
        type: Type.STRING,
        description: 'The ZLECAf customs duty rate, e.g., 4,5 %.',
      },
      vat: {
        type: Type.STRING,
        description: 'The VAT and other taxes, e.g., 16 %.',
      },
    },
    required: ['tariffCode', 'description', 'unit', 'dutyNPF', 'dutyZLECAf', 'vat'],
  },
};

const bivacReportSchema = {
  type: Type.OBJECT,
  properties: {
    reportNumber: { type: Type.STRING },
    inspectionDate: { type: Type.STRING },
    status: { type: Type.STRING },
    exporter: { type: Type.STRING },
    importer: { type: Type.STRING },
    goodsDescription: { type: Type.STRING },
    fobValue: { type: Type.STRING },
    hsCode: { type: Type.STRING },
    observations: { type: Type.STRING },
  },
  required: ['reportNumber', 'inspectionDate', 'status', 'exporter', 'importer', 'goodsDescription', 'fobValue', 'hsCode', 'observations'],
};

const vehicleReportSchema = {
  type: Type.OBJECT,
  properties: {
    chassisNumber: { type: Type.STRING },
    make: { type: Type.STRING },
    model: { type: Type.STRING },
    year: { type: Type.NUMBER },
    engineDisplacement: { type: Type.STRING },
    fuelType: { type: Type.STRING },
    countryOfOrigin: { type: Type.STRING },
    estimatedValueCIF: { type: Type.STRING },
    hsCode: { type: Type.STRING },
    technicalObservations: { type: Type.STRING },
  },
  required: ['chassisNumber', 'make', 'model', 'year', 'engineDisplacement', 'fuelType', 'countryOfOrigin', 'estimatedValueCIF', 'hsCode', 'technicalObservations'],
};

const suggestionResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      suggestion: {
        type: Type.STRING,
        description: 'A suggested tariff code or product description, e.g., "09.01" or "Café, même torréfié ou décaféiné"',
      },
      type: {
        type: Type.STRING,
        description: 'The type of suggestion, either "code" or "description".',
      },
    },
    required: ['suggestion', 'type'],
  },
};


export const searchTariffs = async (query: string): Promise<TariffItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert API that provides information from the Democratic Republic of Congo's 2021 tariff schedule (TARIFS DES DROITS ET TAXES A L’IMPORTATION ET A L’EXPORTATION /ZLECAf). Your task is to find relevant tariff items based on the user's query. Interpret the query flexibly: it could be a product name, a tariff code, a partial description, or a natural language question (e.g., "what are the taxes on coffee beans?"). Be tolerant of spelling mistakes and find the closest matches. Return the results in the specified JSON format. User query: '${query}'`,
      config: {
        responseMimeType: "application/json",
        responseSchema: tariffResponseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    
    const data = JSON.parse(jsonText);
    return data as TariffItem[];
  } catch (error) {
    console.error("Error calling Gemini API for tariff search:", error);
    throw new Error("Failed to fetch tariff information from Gemini API.");
  }
};

export const getTariffSuggestions = async (partialQuery: string): Promise<Suggestion[]> => {
  if (partialQuery.length < 3) {
    return [];
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an autocomplete service for the DRC tariff schedule. Based on the user's partial query, suggest up to 5 relevant and distinct product descriptions or tariff codes. Prioritize conciseness and relevance. Do not suggest things that are too generic. User's partial query: '${partialQuery}'`,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionResponseSchema,
      },
    });
    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    const data = JSON.parse(jsonText);
    return data as Suggestion[];
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    // Don't throw an error, just return empty array for a smoother UX
    return [];
  }
};

export const checkBivacStatus = async (bivacId: string): Promise<BivacReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a mock API simulating the BIVAC DRC inspection system. Based on the user's BIVAC number, generate a plausible inspection report. If the user provides 'NOT-FOUND' as the number, return a report with the status 'Not Found' and empty strings for other fields. For any other input, generate a realistic-looking report. BIVAC Number: '${bivacId}'`,
       config: {
        responseMimeType: "application/json",
        responseSchema: bivacReportSchema,
      },
    });
    const data = JSON.parse(response.text);
    return data as BivacReport;
  } catch (error) {
    console.error("Error calling Gemini API for BIVAC check:", error);
    throw new Error("Failed to fetch BIVAC information from Gemini API.");
  }
};

export const getVehicleReport = async (chassisNumber: string): Promise<VehicleReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a mock API simulating a vehicle technical report system for DRC customs. Based on the user's vehicle chassis number (VIN), generate a plausible technical report. If the user provides 'NOT-FOUND' as the chassis number, return a report with 'Not Found' in most fields. For any other input, generate a realistic-looking report with make, model, year, and technical details. Chassis Number: '${chassisNumber}'`,
       config: {
        responseMimeType: "application/json",
        responseSchema: vehicleReportSchema,
      },
    });
    const data = JSON.parse(response.text);
    return data as VehicleReport;
  } catch (error) {
    console.error("Error calling Gemini API for Vehicle check:", error);
    throw new Error("Failed to fetch Vehicle information from Gemini API.");
  }
};