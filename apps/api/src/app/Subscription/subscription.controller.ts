import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AUTH500 } from '../../exception';
import { Roles } from '../app.decorator';
import { Role, User, SubscribeDto, SubscribeQueryDto } from '../app.dto';
import { AuthenticatedGuard } from '../Auth/auth.guard';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AuthenticatedGuard)
@Roles(Role.DEVELOPER, Role.SECRETARY)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post('new')
  async subscribe(@Req() request: Request, @Body() subcription: SubscribeDto) {
    const { preferred_lang } = request.user as User;
    try {
      const { school_code, total_paid, transaction_id } = subcription;
      const unit_price = Number(process.env.NX_API_UNIT_PRICE);
      return await this.subscriptionService.create({
        total_paid,
        unit_price,
        transaction_id,
        School: { connect: { school_code } },
        number_of_apis: Math.floor(total_paid / unit_price),
      });
    } catch (error) {
      throw new HttpException(
        AUTH500[preferred_lang],
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all')
  async getSubscriptions(@Query() { school_code }: SubscribeQueryDto) {
    return await this.subscriptionService.findAll(school_code);
  }
}
