import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductPaginateModel } from './schema/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: ProductPaginateModel) { }

  private readonly logger = new Logger('ProductService');

  create(createProductDto: CreateProductDto, user: any): Promise<Product> {
    const product = new this.productModel({
      ...createProductDto, owner: user.userId
    });
    return product.save();
  }

  async findAll(page: number, limit: number) {
    return this.productModel.paginate(
      { available: true },
      {
        page, limit, sort: { createdAt: -1 }, populate: { path: 'owner', select: 'user email name' }
      }
    )

  }

  async findOne(id: string) {
    const product = await this.productModel.findOne({
      idProduct: id, available: true
    }).populate('owner').exec()

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`)
    }
    return product;
  }

  async update(idProduct: string, updateProductDto: UpdateProductDto, user: any) {
    const product = await this.findOne(idProduct);
    console.log(product)
    if (!product) {
      throw new NotFoundException(`Product with id ${product} not found`)
    }
    if (product.owner._id == user.userId) {
      await this.productModel.updateOne({ idProduct }, updateProductDto)
      return this.productModel.findOne({ idProduct })
    }
    else {
      throw new ConflictException(`You not are owner of Product, so you can't update the product ${idProduct}`)
    }
  }

  async remove(idProduct: string, user: any) {
    const productOne = await this.findOne(idProduct);
    if (productOne.owner._id == user.userId) {
      const product = await this.productModel.findOneAndUpdate({ idProduct }, { available: false }, { new: true }).exec()
      return product;
    }
    else {
      throw new ConflictException(`You not are owner of Product, so you can't delete the product ${idProduct}`)
    }
  }
}
