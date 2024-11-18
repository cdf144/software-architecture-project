import { Model, Sequelize } from "sequelize";

declare module "db/models" {
  export interface ShortenedUrlAttributes {
    id: string;
    url: string;
  }

  export class ShortenedUrl
    extends Model<ShortenedUrlAttributes>
    implements ShortenedUrlAttributes
  {
    public id!: string;
    public url!: string;
  }

  export const sequelize: Sequelize;
  export const Sequelize: typeof Sequelize;
}
