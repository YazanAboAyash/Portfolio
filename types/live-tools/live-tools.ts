/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export interface CalculatorInputs {
  hoursPerWeek: number;
  hourlyRate: number; // Internal cost of the employee doing the task
  automationCost: number; // Your estimated fee
}

export interface ROIMetrics {
  weeklyCost: number;
  annualCost: number;
  breakEvenWeeks: number;
  firstYearSavings: number;
  isProfitable: boolean;
}
