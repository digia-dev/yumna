import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import type { CreateEventDto, UpdateEventDto } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  create(
    @GetUser('id') userId: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(familyId, userId, dto);
  }

  @Get()
  findAll(@GetUser('familyId') familyId: string) {
    return this.eventsService.findAll(familyId);
  }

  @Get('upcoming')
  getUpcoming(@GetUser('familyId') familyId: string) {
    return this.eventsService.getUpcoming(familyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('familyId') familyId: string) {
    return this.eventsService.findOne(id, familyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, familyId, dto);
  }

  // 379 – Update agenda slots for a meeting
  @Patch(':id/agenda')
  updateAgenda(
    @Param('id') id: string,
    @GetUser('familyId') familyId: string,
    @Body('agendaSlots') agendaSlots: string[],
  ) {
    return this.eventsService.updateAgenda(id, familyId, agendaSlots);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('familyId') familyId: string) {
    return this.eventsService.remove(id, familyId);
  }
}
