import { Controller } from '@nestjs/common';
import { SubmissionService } from '../services/submission.service';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}
}
