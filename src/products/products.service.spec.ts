import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/product.schema';

describe('ProductsService', () => {
    let service: ProductsService;
    let mockProductModel: any;

    beforeEach(async () => {
        // constructor mock: new this.productModel(dto).save()
        mockProductModel = jest.fn().mockImplementation(dto => ({
            save: jest.fn().mockResolvedValue({ ...dto }),
        }));
        // static methods
        mockProductModel.paginate = jest.fn();
        mockProductModel.findOne = jest.fn();
        mockProductModel.updateOne = jest.fn();
        mockProductModel.findOneAndUpdate = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getModelToken(Product.name),
                    useValue: mockProductModel,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a product with owner', async () => {
            const dto: CreateProductDto = { name: 'P1', price: 50, idProduct: 'abc' } as any;
            const user = { userId: 'user123' };
            const result = await service.create(dto, user);

            expect(mockProductModel).toHaveBeenCalledWith({ ...dto, owner: user.userId });
            expect(result).toEqual({ ...dto, owner: user.userId });
        });
    });

    describe('findAll', () => {
        it('should call paginate with correct filter and options', async () => {
            const page = 1, limit = 10;
            const fakePaginateResult = { docs: [], totalDocs: 0 };
            mockProductModel.paginate.mockResolvedValue(fakePaginateResult);

            const res = await service.findAll(page, limit);
            expect(mockProductModel.paginate).toHaveBeenCalledWith(
                { available: true },
                {
                    page,
                    limit,
                    sort: { createdAt: -1 },
                    populate: { path: 'owner', select: 'user email name' },
                },
            );
            expect(res).toBe(fakePaginateResult);
        });
    });

    describe('findOne', () => {
        const chain = {
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn(),
        };

        it('should return product when found', async () => {
            const product = { idProduct: 'abc', available: true };
            mockProductModel.findOne.mockReturnValue(chain);
            chain.exec.mockResolvedValue(product);

            const res = await service.findOne('abc');
            expect(mockProductModel.findOne).toHaveBeenCalledWith({ idProduct: 'abc', available: true });
            expect(chain.populate).toHaveBeenCalledWith('owner');
            expect(res).toBe(product);
        });

        it('should throw NotFoundException when not found', async () => {
            mockProductModel.findOne.mockReturnValue(chain);
            chain.exec.mockResolvedValue(null);

            await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const existingProduct = {
            idProduct: 'abc',
            owner: { _id: 'user123' }
        } as any;

        it('should throw NotFoundException if product not exists', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null as any);
            await expect(service.update('abc', {} as UpdateProductDto, { userId: 'user123' }))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if not owner', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...existingProduct } as any);
            await expect(service.update('abc', {} as UpdateProductDto, { userId: 'other' }))
                .rejects.toThrow(ConflictException);
        });

        it('should update and return updated product when owner matches', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
            mockProductModel.updateOne.mockResolvedValue({ nModified: 1 });
            const updated = { idProduct: 'abc', name: 'new' };
            mockProductModel.findOne = jest.fn().mockResolvedValue(updated);

            const res = await service.update('abc', { name: 'new' } as UpdateProductDto, { userId: 'user123' });
            expect(mockProductModel.updateOne).toHaveBeenCalledWith(
                { idProduct: 'abc' },
                { name: 'new' },
            );
            expect(res).toBe(updated);
        });
    });

    describe('remove', () => {
        const existingProduct = {
            idProduct: 'abc',
            owner: { _id: 'user123' }
        } as any;

        it('should throw ConflictException if not owner', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
            await expect(service.remove('abc', { userId: 'other' }))
                .rejects.toThrow(ConflictException);
        });

        it('should soft-delete and return product when owner matches', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
            const deleted = { idProduct: 'abc', available: false };
            mockProductModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(deleted) });

            const res = await service.remove('abc', { userId: 'user123' });
            expect(mockProductModel.findOneAndUpdate).toHaveBeenCalledWith(
                { idProduct: 'abc' },
                { available: false },
                { new: true },
            );
            expect(res).toBe(deleted);
        });
    });
});
