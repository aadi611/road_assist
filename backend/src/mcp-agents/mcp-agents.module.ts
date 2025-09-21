import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

// MCP Agent Services
import { ReportOrchestratorService } from './orchestrator/report-orchestrator.service';
import { LocationProcessorService } from './location-processor/location-processor.service';
import { AiAnalyzerService } from './ai-analyzer/ai-analyzer.service';
import { OfficialFinderService } from './official-finder/official-finder.service';
import { CertificateGeneratorService } from './certificate-generator/certificate-generator.service';
import { SocialPublisherService } from './social-publisher/social-publisher.service';

// Queue Processors
import { ReportProcessingProcessor } from './processors/report-processing.processor';
import { ImageAnalysisProcessor } from './processors/image-analysis.processor';
import { SocialMediaProcessor } from './processors/social-media.processor';

// Entities
import { Report } from '../reports/entities/report.entity';
import { GovernmentOfficial } from '../reports/entities/government-official.entity';
import { Certificate } from '../reports/entities/certificate.entity';
import { SocialPost } from '../reports/entities/social-post.entity';

// External Services
import { OpenAIService } from '../common/services/openai.service';
import { GoogleMapsService } from '../common/services/google-maps.service';
import { TwitterService } from '../common/services/twitter.service';
import { AwsS3Service } from '../common/services/aws-s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, GovernmentOfficial, Certificate, SocialPost]),
    
    // Queue configurations
    BullModule.registerQueue(
      { name: 'report-processing' },
      { name: 'image-analysis' },
      { name: 'social-media' },
      { name: 'certificate-generation' },
    ),
  ],
  providers: [
    // MCP Agent Services
    ReportOrchestratorService,
    LocationProcessorService,
    AiAnalyzerService,
    OfficialFinderService,
    CertificateGeneratorService,
    SocialPublisherService,
    
    // Queue Processors
    ReportProcessingProcessor,
    ImageAnalysisProcessor,
    SocialMediaProcessor,
    
    // External Services
    OpenAIService,
    GoogleMapsService,
    TwitterService,
    AwsS3Service,
  ],
  exports: [
    ReportOrchestratorService,
    LocationProcessorService,
    AiAnalyzerService,
    OfficialFinderService,
    CertificateGeneratorService,
    SocialPublisherService,
  ],
})
export class McpAgentsModule {}
