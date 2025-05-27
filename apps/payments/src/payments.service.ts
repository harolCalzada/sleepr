import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto } from '../../../libs/common/src/dto/create-charge.dto';
import { NOTIFICATIONS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService, @Inject(NOTIFICATIONS_SERVICE)  private readonly notificationsService: ClientProxy) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      typescript: true,
      apiVersion: '2025-04-30.basil',
    });
  }

  async createCharge({ card, amount, email }: PaymentsCreateChargeDto) {
    try {
      // const paymentMethod = await this.stripe.paymentMethods.create({
      //   type: 'card',
      //   card
      // });

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        confirm: true,
        payment_method: 'pm_card_visa',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          integration_check: 'accept_a_payment'
        }
      });

      this.notificationsService.emit('notify_email', { email, text: `Your payment of ${amount}has been processed successfully.` });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Payment processing failed: ' + error.message);
    }
  }
}