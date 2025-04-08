import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';

describe('UserService', () => {
    let service: UserService;
    let mockUserModel: any;

    beforeEach(async () => {
        mockUserModel = jest.fn().mockImplementation(dto => ({
            save: jest.fn().mockResolvedValue({ ...dto, _id: 'generatedId', active: true }),
        }));
        mockUserModel.findOne = jest.fn();
        mockUserModel.paginate = jest.fn();
        mockUserModel.updateOne = jest.fn();
        mockUserModel.findByIdAndUpdate = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    describe('create', () => {
        it('debería lanzar ConflictException si ya existe', async () => {
            mockUserModel.findOne.mockResolvedValue({});
            await expect(
                service.create({ email: 'a@b.com', user: 'u', password: 'p', name: 'n' } as CreateUserDto),
            ).rejects.toThrow(ConflictException);
        });

        it('debería hashear y guardar un usuario nuevo', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPwd');
            const dto = { email: 'a@b.com', user: 'u', password: 'p', name: 'n' } as CreateUserDto;
            const result = await service.create(dto);

            expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
            expect(mockUserModel).toHaveBeenCalledWith({ ...dto, password: 'hashedPwd' });
            expect(result).toMatchObject({ email: 'a@b.com', user: 'u', name: 'n', active: true });
        });
    });

    describe('findAll', () => {
        it('debería llamar a paginate con los parámetros correctos', async () => {
            const fakePage = 2, fakeLimit = 5;
            mockUserModel.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });
            const res = await service.findAll(fakePage, fakeLimit);

            expect(mockUserModel.paginate).toHaveBeenCalledWith(
                { active: true },
                { page: fakePage, limit: fakeLimit, sort: { createdAt: -1 } },
            );
            expect(res).toEqual({ docs: [], totalDocs: 0 });
        });
    });

    describe('findOne', () => {
        it('debería lanzar NotFoundException si no lo encuentra', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
        });

        it('debería devolver el usuario si lo encuentra', async () => {
            const user = { user: 'u', email: 'e', active: true };
            mockUserModel.findOne.mockResolvedValue(user);
            const res = await service.findOne('u');
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ user: 'u', active: true });
            expect(res).toBe(user);
        });
    });

    describe('update', () => {
        it('debería lanzar NotFoundException si no existe', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null as any);
            await expect(service.update('u', {} as UpdateUserDto)).rejects.toThrow(NotFoundException);
        });

        it('debería actualizar y devolver el usuario', async () => {
            const existing = { user: 'u' };
            jest.spyOn(service, 'findOne').mockResolvedValue(existing as any);
            mockUserModel.updateOne.mockResolvedValue({ nModified: 1 });
            const updatedData = { name: 'nuevo' } as UpdateUserDto;
            mockUserModel.findOne = jest.fn().mockResolvedValue({ user: 'u', name: 'nuevo' });
            const res = await service.update('u', updatedData);

            expect(mockUserModel.updateOne).toHaveBeenCalledWith({ user: 'u' }, updatedData);
            expect(res).toEqual({ user: 'u', name: 'nuevo' });
        });
    });

    describe('remove', () => {
        it('debería lanzar NotFoundException si no existe', async () => {
            mockUserModel.findByIdAndUpdate.mockResolvedValue(null);
            await expect(service.remove('u')).rejects.toThrow(NotFoundException);
        });

        it('debería hacer soft delete y devolver el usuario', async () => {
            const deleted = { user: 'u', active: false };
            mockUserModel.findByIdAndUpdate.mockResolvedValue(deleted);
            const res = await service.remove('u');

            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'u',
                { active: false },
                { new: true },
            );
            expect(res).toEqual(deleted);
        });
    });

    describe('findByUsername', () => {
        it('debería llamar a findOne y select para obtener password', async () => {
            const user = { user: 'u', password: 'p' };
            const selectMock = jest.fn().mockResolvedValue(user);
            mockUserModel.findOne.mockReturnValue({ select: selectMock });
            const res = await service.findByUsername('u');

            expect(mockUserModel.findOne).toHaveBeenCalledWith({ user: 'u' });
            expect(selectMock).toHaveBeenCalledWith('+password');
            expect(res).toEqual(user);
        });
    });
});
