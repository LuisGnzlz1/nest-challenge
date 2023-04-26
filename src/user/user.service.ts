import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { User } from './entities/user.entity';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.active = true;
    createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
    try {
      return await this.userModel.create(createUserDto);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    try {
      let user: User;

      if (!user && isValidObjectId(id)) {
        user = await this.userModel.findById(id);
      }

      if (!user) throw new NotFoundException(`Usuario no existe`);

      const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
      const { data } = await firstValueFrom(this.httpService.get(url));
      const chartName = data.chartName;
      console.log('data: ', chartName);

      return user;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    try {
      await user.updateOne(updateUserDto);
      return { ...user.toJSON(), ...updateUserDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.userModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Usuario con el id: "${id}" no existe`);
    return;
  }

  private handleExceptions(error: any) {
    console.log('error: ', error);
    if (error.code === 11000) {
      throw new BadRequestException(`Usuario ya existe en la base de datos`);
    }

    if (error.code === 'ERR_BAD_REQUEST') {
      throw new BadRequestException(
        `Ocurrio un problema consultando a la api de terceros`,
      );
    }
  }
}
