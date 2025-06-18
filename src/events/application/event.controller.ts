import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogHandlerService } from '../../services/log-handler.service';
import { EventService } from '../domain/service/event.service';
import { Event } from '../event.entity';

@Controller('matches')
export class LogParserController {
  constructor(
    private readonly logParserService: LogHandlerService,
    private readonly eventService: EventService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const logContent = file.buffer.toString();
    await this.logParserService.parseLog(logContent);
    return {
      message: 'Log file processed successfully'
    };
  }

  @Get('events')
  async getAllEvents(): Promise<Event[]> {
    return await this.eventService.getAllEvents();
  }
}
