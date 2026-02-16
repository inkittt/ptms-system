import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto, coordinatorId?: string) {
    const { 
      name, 
      year, 
      semester,
      trainingStartDate,
      trainingEndDate,
      deadlinesJSON, 
      minCredits, 
      minWeeks, 
      maxWeeks, 
      isActive,
      coordinatorSignature,
      coordinatorSignatureType,
    } = createSessionDto;

    if (minWeeks > maxWeeks) {
      throw new BadRequestException('Minimum weeks cannot be greater than maximum weeks');
    }

    if (trainingStartDate && trainingEndDate && new Date(trainingStartDate) > new Date(trainingEndDate)) {
      throw new BadRequestException('Training start date cannot be after training end date');
    }

    return this.prisma.session.create({
      data: {
        name,
        year,
        semester,
        trainingStartDate: trainingStartDate ? new Date(trainingStartDate) : null,
        trainingEndDate: trainingEndDate ? new Date(trainingEndDate) : null,
        deadlinesJSON: deadlinesJSON || {},
        minCredits: minCredits || 113,
        minWeeks,
        maxWeeks,
        isActive: isActive ?? true,
        coordinatorId,
        coordinatorSignature,
        coordinatorSignatureType,
        coordinatorSignedAt: coordinatorSignature ? new Date() : null,
      },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    const sessions = await this.prisma.session.findMany({
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' },
      ],
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            studentSessions: true,
          },
        },
      },
    });

    return sessions.map(session => ({
      ...session,
      totalApplications: session._count.applications,
      totalStudents: session._count.studentSessions,
    }));
  }

  async findByCoordinator(coordinatorId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        coordinatorId,
      },
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' },
      ],
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            studentSessions: true,
          },
        },
      },
    });

    return sessions.map(session => ({
      ...session,
      totalApplications: session._count.applications,
      totalStudents: session._count.studentSessions,
    }));
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            studentSessions: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return {
      ...session,
      totalApplications: session._count.applications,
      totalStudents: session._count.studentSessions,
    };
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    await this.findOne(id);

    if (updateSessionDto.minWeeks && updateSessionDto.maxWeeks && updateSessionDto.minWeeks > updateSessionDto.maxWeeks) {
      throw new BadRequestException('Minimum weeks cannot be greater than maximum weeks');
    }

    if (updateSessionDto.trainingStartDate && updateSessionDto.trainingEndDate && 
        new Date(updateSessionDto.trainingStartDate) > new Date(updateSessionDto.trainingEndDate)) {
      throw new BadRequestException('Training start date cannot be after training end date');
    }

    const updateData: any = { ...updateSessionDto };
    
    if (updateSessionDto.trainingStartDate) {
      updateData.trainingStartDate = new Date(updateSessionDto.trainingStartDate);
    }
    
    if (updateSessionDto.trainingEndDate) {
      updateData.trainingEndDate = new Date(updateSessionDto.trainingEndDate);
    }

    return this.prisma.session.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasApplications = await this.prisma.application.count({
      where: { sessionId: id },
    });

    if (hasApplications > 0) {
      throw new BadRequestException('Cannot delete session with existing applications');
    }

    return this.prisma.session.delete({
      where: { id },
    });
  }

  async importStudentsFromCsv(sessionId: string, csvBuffer: Buffer) {
    const session = await this.findOne(sessionId);
    
    const results: any[] = [];
    const stream = Readable.from(csvBuffer.toString());

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const importResults = {
              total: results.length,
              successful: 0,
              failed: 0,
              errors: [] as string[],
            };

            for (const row of results) {
              try {
                const matricNo = row.matricNo?.trim() || row.MatricNo?.trim();
                const creditsEarned = parseInt(row.creditsEarned || row.CreditsEarned);
                let status = (row.status?.trim() || row.Status?.trim() || 'active').toLowerCase();
                
                // Normalize status values - convert 'not_enrolled' or 'no_enrolled' to 'active'
                if (status === 'not_enrolled' || status === 'no_enrolled') {
                  status = 'active';
                }

                if (!matricNo) {
                  importResults.failed++;
                  importResults.errors.push(`Row missing matricNo`);
                  continue;
                }

                if (isNaN(creditsEarned)) {
                  importResults.failed++;
                  importResults.errors.push(`Invalid creditsEarned for ${matricNo}`);
                  continue;
                }

                const user = await this.prisma.user.findUnique({
                  where: { matricNo },
                });

                if (!user) {
                  importResults.failed++;
                  importResults.errors.push(`User with matricNo ${matricNo} not found`);
                  continue;
                }

                // Check if student is already enrolled in another active session
                const existingEnrollment = await this.prisma.studentSession.findFirst({
                  where: {
                    userId: user.id,
                    session: {
                      isActive: true,
                    },
                    NOT: {
                      sessionId: sessionId,
                    },
                  },
                  include: {
                    session: true,
                  },
                });

                if (existingEnrollment) {
                  importResults.failed++;
                  importResults.errors.push(`Student ${matricNo} is already enrolled in another active session: ${existingEnrollment.session.name}`);
                  continue;
                }

                const isEligible = creditsEarned >= session.minCredits;

                if (!isEligible) {
                  importResults.failed++;
                  importResults.errors.push(`Student ${matricNo} does not meet minimum credit requirement (${creditsEarned}/${session.minCredits} credits)`);
                  continue;
                }

                await this.prisma.studentSession.upsert({
                  where: {
                    sessionId_userId: {
                      sessionId,
                      userId: user.id,
                    },
                  },
                  create: {
                    sessionId,
                    userId: user.id,
                    creditsEarned,
                    isEligible,
                    status,
                  },
                  update: {
                    creditsEarned,
                    isEligible,
                    status,
                  },
                });

                importResults.successful++;
              } catch (error) {
                importResults.failed++;
                importResults.errors.push(`Error processing row: ${error.message}`);
              }
            }

            resolve(importResults);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => reject(error));
    });
  }

  async getStudentSession(userId: string, sessionId?: string) {
    if (sessionId) {
      return this.prisma.studentSession.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
        include: {
          session: true,
        },
      });
    }

    const activeSessions = await this.prisma.studentSession.findMany({
      where: {
        userId,
        session: {
          isActive: true,
        },
      },
      include: {
        session: {
          include: {
            coordinator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activeSessions[0] || null;
  }

  async getStudentSessions(userId: string) {
    return this.prisma.studentSession.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            coordinator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSessionStudents(sessionId: string) {
    await this.findOne(sessionId);

    return this.prisma.studentSession.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removeStudentFromSession(sessionId: string, userId: string) {
    const studentSession = await this.prisma.studentSession.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (!studentSession) {
      throw new NotFoundException('Student not found in this session');
    }

    const hasApplication = await this.prisma.application.findFirst({
      where: {
        sessionId,
        userId,
      },
    });

    if (hasApplication) {
      throw new BadRequestException('Cannot remove student with existing application');
    }

    return this.prisma.studentSession.delete({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });
  }

  async uploadCoordinatorSignature(
    sessionId: string,
    coordinatorId: string,
    file: Express.Multer.File,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.coordinatorId !== coordinatorId) {
      throw new BadRequestException('You can only upload signatures for sessions you coordinate');
    }

    const fs = require('fs');
    const imageBuffer = fs.readFileSync(file.path);
    const base64Signature = imageBuffer.toString('base64');

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        coordinatorSignature: base64Signature,
        coordinatorSignatureType: 'image',
        coordinatorSignedAt: new Date(),
      },
    });

    fs.unlinkSync(file.path);

    return {
      message: 'Coordinator signature uploaded successfully',
      signatureUploaded: true,
      signedAt: updatedSession.coordinatorSignedAt,
    };
  }
}
