import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Expose } from "class-transformer";
import { PaginateModel, Types } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { User } from "src/user/schema/user.schema";

@Schema()
export class Product {

    @Prop({ required: true, unique: true })
    @Expose()
    public idProduct: string;
    @Prop({ required: true })
    @Expose()
    public name: string;
    @Prop({ required: true })
    @Expose()
    public price: number;
    @Prop({ default: true })
    public available: boolean;


    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;
}

export const productSchema = SchemaFactory.createForClass(Product)
productSchema.plugin(mongoosePaginate)
export type productDocument = Product & Document;
export interface ProductPaginateModel extends PaginateModel<productDocument> { }
