import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude, Expose } from "class-transformer";
import { PaginateModel } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema()
export class User {
    @Prop({ require: true, unique: true })
    @Expose()
    public user: string;
    @Prop({ require: true, unique: true, trim: true })
    @Expose()
    public email: string;
    @Prop({ required: true, select: false })
    @Exclude()
    public password: string;
    @Prop({ required: true })
    @Expose()
    public name: string;
    @Prop({ default: true })
    @Expose()
    public active: boolean;
    public _id?: string;
}

export const userSchema = SchemaFactory.createForClass(User)
userSchema.plugin(mongoosePaginate);
export type UserDocument = User & Document;
export interface UserPaginateModel extends PaginateModel<UserDocument> { }