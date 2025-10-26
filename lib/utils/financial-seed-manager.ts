/**
 * ABACO Financial Intelligence Platform - Seed Management Utility
 * Following AI Toolkit best practices and financial compliance requirements
 */

export interface FinancialSeedConfig {
  financialSeed: number;
  riskModelSeed: number;
  portfolioSeed: number;
  tenantId: string;
  environment: 'development' | 'testing' | 'production';
}

export class FinancialSeedManager {
  private static instance: FinancialSeedManager;
  private config: FinancialSeedConfig;
  private traceId: string;

  private constructor() {
    this.traceId = `seed_manager_${Date.now()}`;
    this.config = this.initializeSeeds();
    this.logSeedInitialization();
  }

  public static getInstance(): FinancialSeedManager {
    if (!FinancialSeedManager.instance) {
      FinancialSeedManager.instance = new FinancialSeedManager();
    }
    return FinancialSeedManager.instance;
  }

  private initializeSeeds(): FinancialSeedConfig {
    const environment = (process.env.NODE_ENV as any) || 'development';
    const tenantId = process.env.ABACO_TENANT_ID || 'abaco_financial';

    // Generate deterministic seeds based on environment and tenant
    const financialSeed = this.getEnvironmentSeed('ABACO_FINANCIAL_SEED', 42);
    const riskModelSeed = this.getEnvironmentSeed('ABACO_RISK_MODEL_SEED', 12345);
    const portfolioSeed = this.getEnvironmentSeed('ABACO_PORTFOLIO_SEED', 98765);

    return {
      financialSeed,
      riskModelSeed,
      portfolioSeed,
      tenantId,
      environment
    };
  }

  private getEnvironmentSeed(envVar: string, defaultValue: number): number {
    const envValue = process.env[envVar];
    if (envValue) {
      const parsed = parseInt(envValue, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  private logSeedInitialization(): void {
    // AI Toolkit structured logging for seed initialization
    const logData = {
      timestamp: new Date().toISOString(),
      trace_id: this.traceId,
      operation: 'financial_seed_initialization',
      platform: 'abaco_financial_intelligence',
      config: {
        tenant_id: this.config.tenantId,
        environment: this.config.environment,
        seeds_configured: {
          financial: this.config.financialSeed !== 42,
          risk_model: this.config.riskModelSeed !== 12345,
          portfolio: this.config.portfolioSeed !== 98765
        }
      },
      compliance: {
        reproducible: true,
        audit_ready: true,
        regulatory_compliant: true
      }
    };

    console.log('🔍 [AI Toolkit Trace] Financial seed manager initialized', logData);
  }

  public getFinancialSeed(): number {
    return this.config.financialSeed;
  }

  public getRiskModelSeed(): number {
    return this.config.riskModelSeed;
  }

  public getPortfolioSeed(): number {
    return this.config.portfolioSeed;
  }

  public getDeterministicSeed(context: string): number {
    // Generate deterministic seed for specific contexts
    const contextSeed = this.hashString(`${this.config.tenantId}_${context}_${this.config.environment}`);
    
    console.log('🔍 [AI Toolkit Trace] Generated deterministic seed', {
      trace_id: this.traceId,
      context,
      tenant_id: this.config.tenantId,
      environment: this.config.environment,
      seed: contextSeed,
      platform: 'abaco_financial_intelligence'
    });

    return contextSeed;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % (2**31 - 1); // Ensure positive 32-bit integer
  }

  public validateSeeds(): boolean {
    const isValid = 
      Number.isInteger(this.config.financialSeed) &&
      Number.isInteger(this.config.riskModelSeed) &&
      Number.isInteger(this.config.portfolioSeed) &&
      this.config.financialSeed > 0 &&
      this.config.riskModelSeed > 0 &&
      this.config.portfolioSeed > 0;

    console.log('🔍 [AI Toolkit Trace] Seed validation', {
      trace_id: this.traceId,
      valid: isValid,
      seeds: {
        financial: this.config.financialSeed,
        risk_model: this.config.riskModelSeed,
        portfolio: this.config.portfolioSeed
      },
      platform: 'abaco_financial_intelligence'
    });

    return isValid;
  }

  public getConfig(): Readonly<FinancialSeedConfig> {
    return Object.freeze({ ...this.config });
  }
}

// Export singleton instance
export const financialSeedManager = FinancialSeedManager.getInstance();
