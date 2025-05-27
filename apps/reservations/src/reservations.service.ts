import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './reservations/dto/create-reservation.dto';
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { PAYMENTS_SERVICE, UserDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(private readonly reservationRepository: ReservationsRepository, @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy ) {}
  async create(createReservationDto: CreateReservationDto, {email, _id: userId}: UserDto) {
    return this.paymentsService.send('create_charge', {...createReservationDto.charge, email}).pipe(
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
