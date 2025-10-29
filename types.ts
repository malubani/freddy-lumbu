export interface TariffItem {
  tariffCode: string;
  description: string;
  unit: string;
  dutyNPF: string;
  dutyZLECAf: string;
  vat: string;
}

export type FilterOperator = '>=' | '<=' | '==';

export interface FilterCondition {
  operator: FilterOperator;
  value: number;
}

export interface Filters {
  dutyNPF: FilterCondition | null;
  dutyZLECAf: FilterCondition | null;
  vat: FilterCondition | null;
}

export interface BivacReport {
  reportNumber: string;
  inspectionDate: string;
  status: 'Compliant' | 'Non-compliant' | 'Pending' | 'Not Found' | 'Invalid Format' | 'Server Error';
  exporter: string;
  importer: string;
  goodsDescription: string;
  fobValue: string;
  hsCode: string;
  observations: string;
}

export interface VehicleReport {
  chassisNumber: string;
  make: string;
  model: string;
  year: number | 'N/A';
  engineDisplacement: string;
  fuelType: string;
  countryOfOrigin: string;
  estimatedValueCIF: string;
  hsCode: string;
  technicalObservations: string;
}

export interface Suggestion {
  suggestion: string;
  type: 'code' | 'description';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}