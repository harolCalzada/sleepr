import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './reservations/dto/create-reservation.dto';
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { PAYMENTS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(private readonly reservationRepository: ReservationsRepository, @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy ) {}
  async create(createReservationDto: CreateReservationDto, userId: string) {
    return this.paymentsService.send('create_charge', createReservationDto.charge).pipe(
      map((response) => {
        console.log('response create charge!!!!', response);
        return this.reservationRepository.create({
          ...createReservationDto,
          invoiceId: response.id,
          timestamp: new Date(),
          userId,
        });
      })
    )
    // try {
    //   // 1. Process payment
    //   await firstValueFrom(
    //     this.paymentsService.send('create_charge', createReservationDto.charge)
    //   );

    //   // 2. If payment is successful, create the reservation
    //   const reservation = await this.reservationRepository.create({
    //     ...createReservationDto,
    //     invoiceId: response.id,
    //     timestamp: new Date(),
    //     userId,
    //   });

    //   return reservation;
    // } catch (error) {
    //   console.error('Error creating reservation:', error);
    //   throw new Error('Failed to create reservation: ' + error.message);
    // }
    // try {
    //   // 1. Procesar el pago
    //   const paymentResult = await firstValueFrom(
    //     this.paymentsService.send('create_charge', createReservationDto.charge)
    //   );
      
    //   console.log('response create charge!!!!', paymentResult);

    //   // 2. Si el pago es exitoso, crear la reservación
    //   const reservation = await this.reservationRepository.create({
    //     ...createReservationDto,
    //     timestamp: new Date(),
    //     userId,
    //   });

    //   console.log('reservation created', reservation);
    //   return reservation;
      
    // } catch (error) {
    //   console.error('Error al crear reservación:', error);
    //   throw new Error('No se pudo procesar la reservación: ' + error.message);
    // }
  }



  async findAll() {
    return this.reservationRepository.find({});
  }

  async findOne(_id: string) {
    return this.reservationRepository.findOne({ _id: _id });
  }

  async update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  async remove(_id: string) {
    return this.reservationRepository.findOneAndDelete({ _id });
  }
}
