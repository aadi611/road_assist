import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { OpenAIService } from '../../common/services/openai.service';

export interface ImageAnalysisResult {
  issue_type: 'pothole' | 'garbage' | 'broken_streetlight' | 'damaged_road' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  details: {
    size?: string;
    condition: string;
    safety_hazard: boolean;
    estimated_repair_cost?: string;
    urgent_attention_needed: boolean;
  };
  description: string;
  urgency_score: number; // 1-10 scale
  tags: string[];
}

@Injectable()
export class AiAnalyzerService {
  private readonly logger = new Logger(AiAnalyzerService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly openAIService: OpenAIService,
  ) {}

  /**
   * Main entry point for AI analysis of infrastructure images
   */
  async analyzeReport(reportId: string): Promise<ImageAnalysisResult> {
    try {
      this.logger.log(`Starting AI analysis for report ${reportId}`);
      
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        throw new Error(`Report ${reportId} not found`);
      }

      // Update report status
      await this.updateReportStatus(reportId, 'processing');

      // Perform image analysis
      const analysisResult = await this.analyzeImage(
        report.image_url,
        report.location,
        report.address,
      );

      // Generate description
      const description = await this.generateDescription(
        analysisResult,
        report.address,
      );

      const finalResult: ImageAnalysisResult = {
        ...analysisResult,
        description,
      };

      // Update report with analysis results
      await this.updateReportWithAnalysis(reportId, finalResult);

      this.logger.log(`AI analysis completed for report ${reportId}`);
      return finalResult;

    } catch (error) {
      this.logger.error(`AI analysis failed for report ${reportId}:`, error);
      await this.updateReportStatus(reportId, 'failed');
      throw error;
    }
  }

  /**
   * Analyze image using GPT-4V
   */
  private async analyzeImage(
    imageUrl: string,
    location: any,
    address: any,
  ): Promise<Omit<ImageAnalysisResult, 'description'>> {
    const prompt = this.buildAnalysisPrompt(location, address);
    
    const response = await this.openAIService.analyzeImage(imageUrl, prompt);
    
    // Parse and validate the response
    return this.parseAnalysisResponse(response);
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(location: any, address: any): string {
    const locationInfo = this.formatLocationInfo(location, address);
    
    return `You are an expert civic infrastructure analyst. Analyze this image for infrastructure problems.

Location Context: ${locationInfo}
Timestamp: ${new Date().toISOString()}

Please identify:
1. Issue type: pothole, garbage, broken_streetlight, damaged_road, or other
2. Severity: low, medium, high, or critical
3. Confidence level (0-1)
4. Specific details about the problem
5. Safety hazard assessment
6. Urgency score (1-10)
7. Relevant tags

Assessment Criteria:
- Low: Minor cosmetic issues, no immediate danger
- Medium: Noticeable problems affecting usability
- High: Significant issues requiring prompt attention
- Critical: Immediate safety hazards or major infrastructure failure

Return a JSON object with this structure:
{
  "issue_type": "string",
  "severity": "string",
  "confidence": number,
  "details": {
    "size": "string",
    "condition": "string",
    "safety_hazard": boolean,
    "estimated_repair_cost": "string",
    "urgent_attention_needed": boolean
  },
  "urgency_score": number,
  "tags": ["string"]
}`;
  }

  /**
   * Generate professional description for official reporting
   */
  private async generateDescription(
    analysis: Omit<ImageAnalysisResult, 'description'>,
    address: any,
  ): Promise<string> {
    const prompt = `Generate a professional, concise description for this civic infrastructure report:

Issue Type: ${analysis.issue_type}
Severity: ${analysis.severity}
Location: ${this.formatAddressForDescription(address)}
Details: ${JSON.stringify(analysis.details)}
Urgency Score: ${analysis.urgency_score}/10

Requirements:
- 2-3 sentences maximum
- Professional tone suitable for government officials
- Include location and urgency
- Focus on facts and actionable information
- Suitable for social media posting
- Maximum 280 characters

Generate only the description text, no additional formatting.`;

    return await this.openAIService.generateText(prompt, {
      max_tokens: 100,
      temperature: 0.3,
    });
  }

  /**
   * Parse and validate OpenAI response
   */
  private parseAnalysisResponse(response: string): Omit<ImageAnalysisResult, 'description'> {
    try {
      const parsed = JSON.parse(response);
      
      // Validate required fields
      this.validateAnalysisResult(parsed);
      
      return {
        issue_type: parsed.issue_type,
        severity: parsed.severity,
        confidence: Math.min(Math.max(parsed.confidence, 0), 1),
        details: {
          size: parsed.details?.size || 'Not specified',
          condition: parsed.details?.condition || 'Observed damage',
          safety_hazard: parsed.details?.safety_hazard || false,
          estimated_repair_cost: parsed.details?.estimated_repair_cost,
          urgent_attention_needed: parsed.details?.urgent_attention_needed || false,
        },
        urgency_score: Math.min(Math.max(parsed.urgency_score || 5, 1), 10),
        tags: parsed.tags || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse AI analysis response:', error);
      throw new Error('Invalid AI analysis response format');
    }
  }

  /**
   * Validate analysis result structure
   */
  private validateAnalysisResult(result: any): void {
    const validIssueTypes = ['pothole', 'garbage', 'broken_streetlight', 'damaged_road', 'other'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validIssueTypes.includes(result.issue_type)) {
      throw new Error(`Invalid issue type: ${result.issue_type}`);
    }

    if (!validSeverities.includes(result.severity)) {
      throw new Error(`Invalid severity: ${result.severity}`);
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      throw new Error(`Invalid confidence score: ${result.confidence}`);
    }
  }

  /**
   * Format location information for prompt
   */
  private formatLocationInfo(location: any, address: any): string {
    const lat = location?.coordinates?.[1] || 'N/A';
    const lng = location?.coordinates?.[0] || 'N/A';
    const formattedAddress = address?.formatted || 'Address not available';
    
    return `${formattedAddress} (${lat}, ${lng})`;
  }

  /**
   * Format address for description
   */
  private formatAddressForDescription(address: any): string {
    if (!address) return 'Location not specified';
    
    const components = address.components || {};
    const parts = [
      components.route,
      components.locality,
      components.administrative_area_level_1,
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : address.formatted || 'Location not specified';
  }

  /**
   * Update report status
   */
  private async updateReportStatus(reportId: string, status: string): Promise<void> {
    await this.reportRepository.update(reportId, {
      status,
      updated_at: new Date(),
    });
  }

  /**
   * Update report with analysis results
   */
  private async updateReportWithAnalysis(
    reportId: string,
    analysis: ImageAnalysisResult,
  ): Promise<void> {
    await this.reportRepository.update(reportId, {
      issue_type: analysis.issue_type,
      severity: analysis.severity,
      description: analysis.description,
      ai_analysis: analysis,
      status: 'analyzed',
      updated_at: new Date(),
    });
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStatistics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.reportRepository
      .createQueryBuilder('report')
      .select([
        'report.issue_type',
        'report.severity',
        'COUNT(*) as count',
        'AVG(CAST(report.ai_analysis->>\'confidence\' AS FLOAT)) as avg_confidence',
        'AVG(CAST(report.ai_analysis->>\'urgency_score\' AS FLOAT)) as avg_urgency',
      ])
      .where('report.created_at >= :startDate', { startDate })
      .andWhere('report.ai_analysis IS NOT NULL')
      .groupBy('report.issue_type, report.severity')
      .getRawMany();

    return stats;
  }
}
