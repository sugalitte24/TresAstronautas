import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserPaginateModel } from './schema/user.schema';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: UserPaginateModel) { }
  private readonly logger = new Logger('UserService');


  async create(createUserDto: CreateUserDto): Promise<User> {

    const existUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { user: createUserDto.user },
      ],
    });

    if (existUser) {
      throw new ConflictException(`User ${createUserDto.user} or ${createUserDto.email} already exist.`)
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    const userDto = new this.userModel(createUserDto)
    return plainToInstance(User, userDto.save(), { excludeExtraneousValues: true });

  }

  async findAll(page: number, limit: number) {
    return this.userModel.paginate(
      { active: true },
      {
        page, limit, sort: { createdAt: -1 }
      }
    )

  }

  async findOne(user: string) {
    const userModel = await this.userModel.findOne({ user: user, active: true });

    if (!userModel) {
      throw new NotFoundException(`User with user ${user} not found`)
    }
    return userModel;
  }

  async update(user: string, updateUserDto: UpdateUserDto) {
    const userM = await this.findOne(user);
    if (!userM) {
      throw new NotFoundException(`User with id ${user} not found`)
    }
    await this.userModel.updateOne({ user }, updateUserDto)
    return this.userModel.findOne({ user });
  }

  async remove(user: string) {
    const userM = await this.userModel.findByIdAndUpdate(user, { active: false }, { new: true })

    if (!userM) {
      throw new NotFoundException(`User with id ${user} not found`)
    }
    return userM;
  }

  async findByUsername(user: string): Promise<User | null> {
    return this.userModel.findOne({ user }).select('+password');

  }
}

