import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionStatus, CitizenSubmission } from '@prisma/client';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class CitizenService {
  constructor(private readonly prisma: PrismaService, private readonly articlesService: ArticlesService) {}

  async submit(payload: CreateSubmissionDto, _ip: string) {
    const submission = await this.prisma.citizenSubmission.create({
      data: {
        title: payload.title,
        body: payload.body,
        location: payload.location,
        contactEmail: payload.email,
        contactPhone: payload.phone,
        media: payload.media ?? [],
        status: SubmissionStatus.NEW
      }
    });
    return { ...toCitizenResponse(submission), verification: 'OTP_PENDING' } as const;
  }

  async list() {
    const submissions = await this.prisma.citizenSubmission.findMany({ orderBy: { createdAt: 'desc' } });
    return submissions.map(toCitizenResponse);
  }

  async markTriaged(id: string) {
    const submission = await this.prisma.citizenSubmission.update({
      where: { id },
      data: { status: SubmissionStatus.TRIAGED }
    });
    return toCitizenResponse(submission);
  }

  async reject(id: string, reason: string) {
    const submission = await this.prisma.citizenSubmission.update({
      where: { id },
      data: { status: SubmissionStatus.REJECTED, rejectionReason: reason }
    });
    return toCitizenResponse(submission);
  }

  async promote(id: string, userId: string) {
    const submission = await this.prisma.citizenSubmission.findUnique({ where: { id } });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    const article = await this.articlesService.create(userId, {
      title: submission.title,
      body: submission.body,
      section: 'Citizen Desk',
      tags: ['citizen'],
      excerpt: submission.body.slice(0, 140),
      location: submission.location ?? undefined,
      lang: 'en'
    });
    await this.prisma.$transaction([
      this.prisma.citizenSubmission.update({
        where: { id },
        data: { status: SubmissionStatus.PROMOTED, article: { connect: { id: article.id } } }
      }),
      this.prisma.article.update({ where: { id: article.id }, data: { submission: { connect: { id } } } })
    ]);
    return article;
  }
}

function toCitizenResponse(submission: CitizenSubmission) {
  return {
    ...submission,
    contact: { email: submission.contactEmail ?? undefined, phone: submission.contactPhone ?? undefined }
  };
}
