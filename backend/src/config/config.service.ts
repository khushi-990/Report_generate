import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from './config.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
  ) {}

  async getPaginationConfig() {
    let config = await this.configModel.findOne({ key: 'pagination' }).exec();
    
    if (!config) {
      config = new this.configModel({
        key: 'pagination',
        pageSize: 1,
        currentPage: 1,
      });
      await config.save();
    }
    
    return config;
  }

  async updatePaginationConfig(pageSize: number) {
    const config = await this.configModel.findOneAndUpdate(
      { key: 'pagination' },
      { pageSize, currentPage: 1 },
      { new: true, upsert: true },
    ).exec();
    
    return config;
  }
}

