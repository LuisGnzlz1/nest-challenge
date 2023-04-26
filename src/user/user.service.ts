import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
    let user: User;

    if (!user && isValidObjectId(id)) {
      user = await this.userModel.findById(id);
    }

    if (!user) throw new NotFoundException(`Usuario no existe`);
    return user;
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
    if (error.code === 11000) {
      throw new BadRequestException(`Usuario ya existe en la base de datos`);
    }
  }
}
