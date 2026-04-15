import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import type { CreateNoteDto, UpdateNoteDto } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  create(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(familyId, userId, dto);
  }

  @Get()
  findAll(
    @GetUser('familyId') familyId: string,
    @Query('search') search?: string,
  ) {
    return this.notesService.findAll(familyId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('familyId') familyId: string) {
    return this.notesService.findOne(id, familyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, familyId, userId, dto);
  }

  @Patch(':id/pin')
  togglePin(@Param('id') id: string, @GetUser('familyId') familyId: string) {
    return this.notesService.togglePin(id, familyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('familyId') familyId: string) {
    return this.notesService.remove(id, familyId);
  }
}
